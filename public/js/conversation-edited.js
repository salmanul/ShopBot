// The ConversationPanel module is designed to handle
// all display and behaviors of the conversation column of the app.
/* eslint no-unused-vars: "off" */
/* global Api: true, Common: true*/



var ConversationPanel = (function() {
  var settings = {
    selectors: {
      chatBox: '#scrollingChat',
      fromUser: '.from-user',
      fromWatson: '.from-watson',
      latest: '.latest'
    },
    authorTypes: {
      user: 'user',
      watson: 'watson'
    }
  };

  // Publicly accessible methods defined
  return {
    init: init,
    inputKeyDown: inputKeyDown
  };

  // Initialize the module
  function init() {
    chatUpdateSetup();
    Api.sendRequest( '', null );
    setupInputBox();
  }
  // Set up callbacks on payload setters in Api module
  // This causes the displayMessage function to be called when messages are sent / received
  function chatUpdateSetup() {
    var currentRequestPayloadSetter = Api.setRequestPayload;
    Api.setRequestPayload = function(newPayloadStr) {
      currentRequestPayloadSetter.call(Api, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr), settings.authorTypes.user);
    };

    var currentResponsePayloadSetter = Api.setResponsePayload;
    Api.setResponsePayload = function(newPayloadStr) {
      currentResponsePayloadSetter.call(Api, newPayloadStr);
  
      displayMessage(JSON.parse(newPayloadStr), settings.authorTypes.watson,function(){
        var animatingElement = document.getElementsByClassName('animation_holder');
		
        if(animatingElement.length == 0)
		{
			//Nothing
		}
		else{
			animatingElement[0].remove();
		}
    });
    };
  }

// Set up the input box to underline text as it is typed
  // This is done by creating a hidden dummy version of the input box that
  // is used to determine what the width of the input text should be.
  // This value is then used to set the new width of the visible input box.
  function setupInputBox() {
    var input = document.getElementById('textInput');
    var dummy = document.getElementById('textInputDummy');
    var minFontSize = 14;
    var maxFontSize = 16;
    var minPadding = 4;
    var maxPadding = 6;

    // If no dummy input box exists, create one
    if (dummy === null) {
      var dummyJson = {
        'tagName': 'div',
        'attributes': [{
          'name': 'id',
          'value': 'textInputDummy'
        }]
      };

      dummy = Common.buildDomElement(dummyJson);
      document.body.appendChild(dummy);
    }

    function adjustInput() {
      if (input.value === '') {
        // If the input box is empty, remove the underline
        input.classList.remove('underline');
        input.setAttribute('style', 'width:' + '100%');
        input.style.width = '100%';
      } else {
        // otherwise, adjust the dummy text to match, and then set the width of
        // the visible input box to match it (thus extending the underline)
        input.classList.add('underline');
        var txtNode = document.createTextNode(input.value);
        ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height',
          'text-transform', 'letter-spacing'].forEach(function(index) {
            dummy.style[index] = window.getComputedStyle(input, null).getPropertyValue(index);
          });
        dummy.textContent = txtNode.textContent;

        var padding = 0;
        var htmlElem = document.getElementsByTagName('html')[0];
        var currentFontSize = parseInt(window.getComputedStyle(htmlElem, null).getPropertyValue('font-size'), 10);
        if (currentFontSize) {
          padding = Math.floor((currentFontSize - minFontSize) / (maxFontSize - minFontSize)
            * (maxPadding - minPadding) + minPadding);
        } else {
          padding = maxPadding;
        }

        var widthValue = ( dummy.offsetWidth + padding) + 'px';
        input.setAttribute('style', 'width:' + widthValue);
        input.style.width = widthValue;
      }
    }

    // Any time the input changes, or the window resizes, adjust the size of the input box
    input.addEventListener('input', adjustInput);
    window.addEventListener('resize', adjustInput);

    // Trigger the input event once to set up the input box and dummy element
    Common.fireEvent(input, 'input');
  }

  // Display a user or Watson message that has just been sent/received
  function displayMessage(newPayload, typeValue,callback) {
      var isUser = isUserMessage(typeValue);
      var textExists = (newPayload.input && newPayload.input.text)
          || (newPayload.output && newPayload.output.text);
      if (isUser !== null && textExists) {
          // Create new message DOM element
          var messageDivs = buildMessageDomElements(newPayload, isUser);
          var chatBoxElement = document.querySelector(settings.selectors.chatBox);
          var previousLatest = chatBoxElement.querySelectorAll((isUser
              ? settings.selectors.fromUser : settings.selectors.fromWatson)
              + settings.selectors.latest);
          // Previous "latest" message is no longer the most recent
          if (previousLatest) {
              Common.listForEach(previousLatest, function (element) {
                  element.classList.remove('latest');
              });
          }

          messageDivs.forEach(function (currentDiv) {
              chatBoxElement.appendChild(currentDiv);
              // Class to start fade in animation
              currentDiv.classList.add('load');
          });
          var h5 = document.createElement('h5');
          h5.className = 'time';
          h5.innerHTML = formatAMPM(new Date());

          if (typeValue == 'watson') {
              $(".from-watson").last().addClass("animated fadeIn").append(h5);
          }
          if (typeValue == 'user') {
              $(".from-user").last().addClass("animated fadeIn").append(h5);
          }
          // Move chat to the most recent messages when new messages are added
          scrollToChatBottom();
      }


      if (typeValue == 'watson' && Api.getResponsePayload().context.ReviewFlag == 'facebook')
      {
          DomForSocialDetails.DOMForFacebook();
          //DomForSocialDetails.DOMForTwitter();
      }
	  if (typeValue == 'watson' && Api.getResponsePayload().context.ReviewFlag == 'twitter')
      {
          //DomForSocialDetails.DOMForFacebook();
          DomForSocialDetails.DOMForTwitter();
      }


      if (Api.getResponsePayload().context.CardViewFlag == 'on' && typeValue == 'watson') {
          console.log('Card View Detected');

          if ((Api.getResponsePayload().context.GroupFlag == 'on' && Api.getResponsePayload().context.HealthyFlag == 'on') || Api.getResponsePayload().context.CategoriesFlag == 'Healthy') {
              cardView.imageSource = 'img/images/categories/healthy/1.jpg';
              cardView.jsonSource = 'img/images/categories/healthy/1.json';
              cardView.buildView();
              //scrollToChatBottom();
          }
          if ((Api.getResponsePayload().context.GroupFlag == 'on' && Api.getResponsePayload().context.TastyFlag == 'on') || Api.getResponsePayload().context.CategoriesFlag == 'Tasty') {
              cardView.imageSource = 'img/images/categories/tasty/1.jpg';
              cardView.jsonSource = 'img/images/categories/tasty/1.json';
              cardView.buildView();
              //scrollToChatBottom();
          }
          if ((Api.getResponsePayload().context.GroupFlag == 'on' && Api.getResponsePayload().context.BigBudgetFlag == 'on') || Api.getResponsePayload().context.CategoriesFlag == 'Big Budget') {
              cardView.imageSource = 'img/images/categories/bigBudget/1.jpg';
              cardView.jsonSource = 'img/images/categories/bigBudget/1.json';
              cardView.buildView();
              //scrollToChatBottom();
          }
          if ((Api.getResponsePayload().context.GroupFlag == 'on' && Api.getResponsePayload().context.NutsFlag == 'on') || Api.getResponsePayload().context.CategoriesFlag == 'Nuts and Raisins') {
              cardView.imageSource = 'img/images/categories/nuts/1.jpg';
              cardView.jsonSource = 'img/images/categories/nuts/1.json';

              cardView.buildView();
              //scrollToChatBottom();
          }
          if ((Api.getResponsePayload().context.GroupFlag == 'on' && Api.getResponsePayload().context.CreamFlag == 'on') || Api.getResponsePayload().context.CategoriesFlag == 'Cream') {
              cardView.imageSource = 'img/images/categories/cream/1.jpg';
              cardView.jsonSource = 'img/images/categories/cream/1.json';

              cardView.buildView();
              //scrollToChatBottom();
          }
          if ((Api.getResponsePayload().context.GroupFlag == 'on' && Api.getResponsePayload().context.LatestFlag == 'on') || Api.getResponsePayload().context.CategoriesFlag == 'Trends') {
              cardView.imageSource = 'img/images/categories/trends/1.jpg';
              cardView.jsonSource = 'img/images/categories/trends/1.json';

              cardView.buildView();
              //scrollToChatBottom();
          }
          if (Api.getResponsePayload().context.GroupFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Atta') {
              cardView.imageSource = 'img/images/Aashirvaad/AashirvaadAtta/1.jpg';
              cardView.jsonSource = 'img/images/Aashirvaad/AashirvaadAtta/1.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.GroupFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Ghee') {
              cardView.imageSource = 'img/images/Aashirvaad/AashirvaadGhee/1.jpg';
              cardView.jsonSource = 'img/images/Aashirvaad/AashirvaadGhee/1.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.GroupFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Spices') {
              cardView.imageSource = 'img/images/Aashirvaad/AashirvaadSpices/1.jpg';
              cardView.jsonSource = 'img/images/Aashirvaad/AashirvaadSpices/1.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.GroupFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Bingo') {
              cardView.imageSource = 'img/images/Bingo/1.jpg';
              cardView.jsonSource = 'img/images/Bingo/1.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.GroupFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Yipee') {
              cardView.imageSource = 'img/images/Yipee/1.jpg';
              cardView.jsonSource = 'img/images/Yipee/1.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.GroupFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Bnatural') {
              cardView.imageSource = 'img/images/BNaturals/1.jpg';
              cardView.jsonSource = 'img/images/BNaturals/1.json';
              cardView.buildView();
          }

          if (Api.getResponsePayload().context.GroupFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Biscuit' && Api.getResponsePayload().context.HealthyFlag != 'on' && Api.getResponsePayload().context.TastyFlag != 'on' && Api.getResponsePayload().context.BigBudgetFlag != 'on' && Api.getResponsePayload().context.NutsFlag != 'on' && Api.getResponsePayload().context.CreamFlag != 'on' && Api.getResponsePayload().context.LatestFlag != 'on' && Api.getResponsePayload().context.CategoriesFlag == "" && Api.getResponsePayload().context.FlavoursFlag == "") {
              cardViewCategory.buildViewC();
              //scrollToChatBottom();
          }

          if (Api.getResponsePayload().context.GroupFlag == 'on' && Api.getResponsePayload().context.productFlag == '' && Api.getResponsePayload().context.HealthyFlag != 'on' && Api.getResponsePayload().context.TastyFlag != 'on' && Api.getResponsePayload().context.BigBudgetFlag != 'on' && Api.getResponsePayload().context.NutsFlag != 'on' && Api.getResponsePayload().context.CreamFlag != 'on' && Api.getResponsePayload().context.LatestFlag != 'on' && Api.getResponsePayload().context.CategoriesFlag == "" && Api.getResponsePayload().context.FlavoursFlag == "") {
              //cardViewCategory.buildProductView();
              //scrollToChatBottom();
              var bannerImg = document.createElement('DIV');
              bannerImg.setAttribute('style', '/*width: 52rem;height: 20rem;*/');
              bannerImg.innerHTML = '<img src="/img/banner.jpg" style="width: 79%;margin-left: 3.3rem;margin-top:0.5rem;margin-bottom:1rem;">';


              var DivBtnGrop = document.createElement('DIV');
              DivBtnGrop.setAttribute('class', 'btn-group');
              DivBtnGrop.setAttribute('id', 'buttons-group-view');
              DivBtnGrop.setAttribute('style', 'display:block;margin-bottom:1rem;text-align:center;margin-top:-1rem !important;');

              for (i = 0; i < 5; i++) {
                  var Btn = document.createElement('BUTTON');
                  Btn.setAttribute('type', 'button');
                  Btn.className = "btn btn-outline-secondary btn-rounded waves-effect";
                  Btn.setAttribute('onclick', 'submitInput(this)');
                  Btn.setAttribute('id', 'btn-group-btns')
                  Btn_values = [
                      "Sunfeast Biscuits",
                      "Aashirvaad",
                      "Bnaturals",
                      "Bingo",
                      "Yipee"
                  ];
                  Btn.innerHTML = Btn_values[i];
                  Btn.value = Btn_values[i];
                  DivBtnGrop.appendChild(Btn);

              }


              var Chat_column = document.getElementById('scrollingChat');
              Chat_column.appendChild(bannerImg);
              Chat_column.appendChild(DivBtnGrop);

              Chat_column.scrollTop = Chat_column.scrollHeight - Chat_column.lastChild.scrollHeight;


          }

          //scrollToChatBottom();
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Dark fantacy') {
              cardView.imageSource = 'img/images/categories/bigBudget/1.jpg';
              cardView.jsonSource = 'img/images/categories/bigBudget/1.json';
              cardView.buildView();

          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Farmlite Digestive') {
              cardView.imageSource = 'img/images/categories/healthy/1.jpg';
              cardView.jsonSource = 'img/images/categories/healthy/1.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Farmlite Oats With Chocolate') {
              cardView.imageSource = 'img/images/categories/bigBudget/4.jpg';
              cardView.jsonSource = 'img/images/categories/bigBudget/4.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Farmlite Oats With Raisins') {
              cardView.imageSource = 'img/images/categories/bigBudget/4.jpg';
              cardView.jsonSource = 'img/images/categories/bigBudget/4.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Farmlite Oats With Almond') {
              cardView.imageSource = 'img/images/categories/bigBudget/4.jpg';
              cardView.jsonSource = 'img/images/categories/bigBudget/4.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Marie Light') {
              cardView.imageSource = 'img/images/categories/healthy/2.jpg';
              cardView.jsonSource = 'img/images/categories/healthy/2.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Dark Fantacy Luxuria') {
              cardView.imageSource = 'img/images/categories/bigBudget/2.jpg';
              cardView.jsonSource = 'img/images/categories/bigBudget/2.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Dark Fantacy Choco Fills') {
              cardView.imageSource = 'img/images/categories/bigBudget/1.jpg';
              cardView.jsonSource = 'img/images/categories/bigBudget/1.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Dark Fantacy Choco Meltz') {
              cardView.imageSource = 'img/images/categories/bigBudget/3.jpg';
              cardView.jsonSource = 'img/images/categories/bigBudget/3.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Bounce') {
              cardView.imageSource = 'img/images/categories/cream/2.jpg';
              cardView.jsonSource = 'img/images/categories/cream/2.json';
              cardView.flagForHideBtn = true;
			  cardView.flagForHideBubbles = true;
              cardView.buildView();

          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Dream Cream') {
              cardView.imageSource = 'img/images/categories/cream/1.jpg';
              cardView.jsonSource = 'img/images/categories/cream/1.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Delishus') {
              cardView.imageSource = 'img/images/categories/bigBudget/5.jpg';
              cardView.jsonSource = 'img/images/categories/bigBudget/5.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'HiFi') {
              cardView.imageSource = 'img/images/categories/trends/4.jpg';
              cardView.jsonSource = 'img/images/categories/trends/4.json';
              cardView.flagForHideBtn = true;
			  cardView.flagForHideBubbles = true;
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Moms Magic') {
              cardView.imageSource = 'img/images/categories/nuts/3.jpg';
              cardView.jsonSource = 'img/images/categories/nuts/3.json';
              cardView.flagForHideBtn = true;
			  cardView.flagForHideBubbles = true;
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Glucose') {
              cardView.imageSource = 'img/images/categories/healthy/3.jpg';
              cardView.jsonSource = 'img/images/categories/healthy/3.json';
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Milky Magic') {
              cardView.imageSource = 'img/images/categories/healthy/4.jpg';
              cardView.jsonSource = 'img/images/categories/healthy/4.json';
              cardView.flagForHideBtn = true;
			  cardView.flagForHideBubbles = true;
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'BourBon Bliss') {
              cardView.imageSource = 'img/images/categories/tasty/2.jpg';
              cardView.jsonSource = 'img/images/categories/testy/2.json';
              cardView.flagForHideBtn = true;
			  cardView.flagForHideBubbles = true;
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Yum Fills') {
              cardView.imageSource = 'img/images/categories/cream/3.jpg';
              cardView.jsonSource = 'img/images/categories/cream/3.json';
              cardView.flagForHideBtn = true;
			  cardView.flagForHideBubbles = true;
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Snacky') {
              cardView.imageSource = 'img/images/categories/trends/5.jpg';
              cardView.jsonSource = 'img/images/categories/trends/5.json';
              cardView.flagForHideBtn = true;
			  cardView.flagForHideBubbles = true;
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'SweetNsalt') {
              cardView.imageSource = 'img/images/categories/trends/6.jpg';
              cardView.jsonSource = 'img/images/categories/trends/6.json';
              cardView.flagForHideBtn = true;
			  cardView.flagForHideBubbles = true;
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Nice') {
              cardView.imageSource = 'img/images/categories/trends/7.jpg';
              cardView.jsonSource = 'img/images/categories/trends/7.json';
              cardView.flagForHideBtn = true;
			  cardView.flagForHideBubbles = true;
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Whole Wheat Atta') {
              cardView.imageSource = 'img/images/Aashirvaad/AashirvaadAtta/4.jpg';
              cardView.jsonSource = 'img/images/Aashirvaad/AashirvaadAtta/4.json';
              cardView.flagForHideBtn = true;
			  cardView.flagForHideBubbles = true;
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Sugar Release Control Atta') {
              cardView.imageSource = 'img/images/Aashirvaad/AashirvaadAtta/6.jpg';
              cardView.jsonSource = 'img/images/Aashirvaad/AashirvaadAtta/6.json';
              cardView.flagForHideBtn = true;
			  cardView.flagForHideBubbles = true;
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'Select Atta') {
              cardView.imageSource = 'img/images/Aashirvaad/AashirvaadAtta/5.jpg';
              cardView.jsonSource = 'img/images/Aashirvaad/AashirvaadAtta/5.json';
              cardView.flagForHideBtn = true;
			  cardView.flagForHideBubbles = true;
              cardView.buildView();
          }
          if (Api.getResponsePayload().context.SinglesFlag == 'on' && Api.getResponsePayload().context.productFlag == 'location') {

              var bannerImg_location = document.createElement('DIV');
              bannerImg_location.setAttribute('style', '/*width: 52rem;height: 20rem;*/');
              bannerImg_location.innerHTML = '<img src="/img/ITClocation.jpg" style="width: 79%;margin-left:3.7rem;margin-top:0.5rem;margin-bottom:1rem;">';

              var Chat_column = document.getElementById('scrollingChat');
              Chat_column.appendChild(bannerImg_location);

              Chat_column.scrollTop = Chat_column.scrollHeight - Chat_column.lastChild.scrollHeight;
          }
		  if(Api.getResponsePayload().context.ingredientFlag == 'Dark Fantacy'){

			  var image_ingredient = document.createElement('DIV');
			  image_ingredient.setAttribute('style','width: 50%;margin-left: 3rem;');
			  image_ingredient.innerHTML = '<img src="/img/ingredients.png">';

			  var Chat_column = document.getElementById('scrollingChat');
              Chat_column.appendChild(image_ingredient);

			  Chat_column.scrollTop = Chat_column.scrollHeight - Chat_column.lastChild.scrollHeight;
			  //scrollToChatBottom();
		  }
		  if(Api.getResponsePayload().context.imageFlag == 'feedback'){

			  var image_feedback = document.createElement('DIV');
			  image_feedback.setAttribute('style','width: 50%;margin-left: 3rem;');
			  image_feedback.innerHTML = '<img src="/img/feedback.png">';

			  var Chat_column = document.getElementById('scrollingChat');
              Chat_column.appendChild(image_feedback);

			  Chat_column.scrollTop = Chat_column.scrollHeight - Chat_column.lastChild.scrollHeight;
			  //scrollToChatBottom();
		  }

		  if(Api.getResponsePayload().context.ingredientFlag == 'bnaturals'){

			  var image_feedback = document.createElement('DIV');
			  image_feedback.setAttribute('style','width: 50%;margin-left: 3rem;');
			  image_feedback.innerHTML = '<img src="/img/ingredients_bnaturals.png">';

			  var Chat_column = document.getElementById('scrollingChat');
              Chat_column.appendChild(image_feedback);

			  setTimeout(function(){
			  var Chat_column = document.getElementById('scrollingChat');
			  Chat_column.scrollTop = Chat_column.scrollHeight - Chat_column.lastChild.scrollHeight;
			  }, 500);

			  //Chat_column.scrollTop = Chat_column.scrollHeight - Chat_column.lastChild.scrollHeight;
			  //scrollToChatBottom();
		  }


      }
      //========  For Query Processing =============//
      if (typeValue == 'watson') {
          if (Api.getResponsePayload().context.Qprice != "" && Api.getResponsePayload().context.Qrange != "") {

              console.log('Query');

              //Api End point is /api/query
              var JSONresult;
              var http = new XMLHttpRequest();
              http.open('POST', '/api/query', true);
              http.setRequestHeader('Content-type', 'application/json');
              http.onreadystatechange = function () {
                  if (http.readyState === 4 && http.status === 200 && http.responseText) {
                      JSONresult = http.responseText;
                      //console.log(JSONresult);
                      Query.images = http.response;
                      Query.NavigationForQuery();
                  }
              };
              var bodyJSON = {
                  price: Api.getResponsePayload().context.Qprice,
                  range: Api.getResponsePayload().context.Qrange,
                  product: Api.getResponsePayload().context.Qproduct,
                  price2: ""

              };

              var body = JSON.stringify(bodyJSON);

              http.send(body);

          }
          if (Api.getResponsePayload().context.Qprice != "" && Api.getResponsePayload().context.Qprice2 != "") {
              var JSONresult;
              var http = new XMLHttpRequest();
              http.open('POST', '/api/query', true);
              http.setRequestHeader('Content-type', 'application/json');
              http.onreadystatechange = function () {
                  if (http.readyState === 4 && http.status === 200 && http.responseText) {
                      JSONresult = http.responseText;
                      //console.log(JSONresult);
                      Query.images = http.response;
                      Query.NavigationForQuery();
                  }
              };
              var bodyJSON = {
                  price: Api.getResponsePayload().context.Qprice,
                  price2: Api.getResponsePayload().context.Qprice2,
                  product: Api.getResponsePayload().context.Qproduct,
                  range: ""

              };

              var body = JSON.stringify(bodyJSON);

              http.send(body);


          }

      }

	  //===================== For Prompt text =============//
	  if (typeValue == 'watson' && Api.getResponsePayload().context.PromptFlag == 'on'){
		  console.log('Prompt Flag detected');
		  var Prompt_text = Api.getResponsePayload().context.PromptContent.Value;
		  var domJson = {
          // <div class='segments'>
          'tagName': 'div',
          'classNames': ['segments','load','prompt'],
          'children': [{
            // <div class='from-user/from-watson latest'>
            'tagName': 'div',
            'classNames': ['from-watson', 'latest','top'],
            'children': [{
              // <div class='message-inner'>
              'tagName': 'div',
              'classNames': ['message-inner'],
              'children': [{
                // <p>{messageText}</p>
                'tagName': 'p',
                'text': Prompt_text
              }]
            }]
          }]
        };

		var DOMElement = Common.buildDomElement(domJson);
		DOMElement.getElementsByClassName('from-watson')[0].style.animationDelay = '';
		var Chat_column = document.getElementById('scrollingChat');

		Chat_column.appendChild(DOMElement);

		var h5 = document.createElement('h5');
          h5.className = 'time';
          h5.innerHTML = formatAMPM(new Date());


		$(".from-watson").last().addClass("animated fadeIn").append(h5);
		DOMElement.addEventListener("webkitAnimationEnd", function(){Chat_column.scrollTop = Chat_column.scrollHeight - Chat_column.lastChild.scrollHeight;});

	  }

	  if(typeValue == 'watson' && Api.getResponsePayload().context.CardViewFlag == 'on' && Api.getResponsePayload().context.imageFlag == 'bnatural list'){

			  var image_feedback = document.createElement('DIV');
			  image_feedback.setAttribute('style','margin-left: 3rem;');
			  image_feedback.innerHTML = '<img src="/img/bnatural_list.png">';

			  var Chat_column = document.getElementById('scrollingChat');
              Chat_column.appendChild(image_feedback);

			  Chat_column.scrollTop = Chat_column.scrollHeight - Chat_column.lastChild.scrollHeight;
			  //scrollToChatBottom();
		  }
		if(typeValue == 'watson' && Api.getResponsePayload().context.CardViewFlag == 'on' && Api.getResponsePayload().context.imageFlag == 'bnatural sizes'){

			  var image_feedback = document.createElement('DIV');
			  image_feedback.setAttribute('style','margin-left: 3rem;');
			  image_feedback.innerHTML = '<img src="/img/bnatural_sizes.png">';

			  var Chat_column = document.getElementById('scrollingChat');
              Chat_column.appendChild(image_feedback);

			  Chat_column.scrollTop = Chat_column.scrollHeight - Chat_column.lastChild.scrollHeight;
			  //scrollToChatBottom();
		  }


	  //====================== For creating Buttons Suggestion ===========
	   if (typeValue == 'watson' && Api.getResponsePayload().context.BtnFlag == 'on') {
          console.log('BtnGroup Flag detected');
          var Btn_length = Api.getResponsePayload().context.BtnContent.Length;
          var Btn_values = Api.getResponsePayload().context.BtnContent.Values;

          var DivBtnGrop = document.createElement('DIV');
          DivBtnGrop.setAttribute('class', 'btn-group');
          DivBtnGrop.setAttribute('id', 'buttons-group-view');
          DivBtnGrop.setAttribute('style', 'display:block;margin-bottom:1rem;text-align:center;');
          for (i = 0; i < Btn_length; i++) {
              var Btn = document.createElement('BUTTON');
              Btn.setAttribute('type', 'button');
              Btn.className = "btn btn-outline-secondary btn-rounded waves-effect";
              Btn.setAttribute('onclick', 'submitInput(this)');
              Btn.setAttribute('id', 'btn-group-btns')

              Btn.innerHTML = Btn_values[i];
              Btn.value = Btn_values[i];
              DivBtnGrop.appendChild(Btn);

              if (Btn_values[i] == 'Like' || Btn_values[i] == 'Unlike') {

                  Btn.innerHTML = '';
                  Btn.setAttribute('id', 'like-or-unlike' + i);

              }
          }


          var Chat_column = document.getElementById('scrollingChat');
		  if(Api.getResponsePayload().context.PromptFlag == 'on')
		  {
			  DivBtnGrop.style.animationDelay = '';

		  }
		  else
		  {
			 DivBtnGrop.style.animationDelay = '';

		  }
          Chat_column.appendChild(DivBtnGrop);


          $(".btn-group").last().addClass("animated fadeIn");
		  DivBtnGrop.addEventListener("webkitAnimationEnd", function(){scrollToChatBottom();});

      }

	  //========== For empty response avoiding ==========
      if (typeValue == 'watson' && Api.getResponsePayload().output.text.length == 0) {
          var Chatwindow = document.getElementById('scrollingChat');

          var ResultNotFound = '<div class="segments load"></div>';
          var DivForSegment = document.createElement('DIV');
          DivForSegment.setAttribute('class', 'segments load');
          DivForSegment.innerHTML = '<div class="from-watson latest top"><div class="message-inner"><p>I can\'t understand you,Please tell me about ITC Food Products</p></div></div>';

          Chatwindow.appendChild(DivForSegment);
		  Chatwindow.scrollTop = Chatwindow.scrollHeight - Chatwindow.lastChild.scrollHeight;

      }

      if(typeValue == 'watson' && callback && typeof(callback) == 'function'){
        callback();
      }
  }


  // Checks if the given typeValue matches with the user "name", the Watson "name", or neither
  // Returns true if user, false if Watson, and null if neither
  // Used to keep track of whether a message was from the user or Watson
  function isUserMessage(typeValue) {
    if (typeValue === settings.authorTypes.user) {
      return true;
    } else if (typeValue === settings.authorTypes.watson) {
      return false;
    }
    return null;
  }

  // Constructs new DOM element from a message payload
  function buildMessageDomElements(newPayload, isUser) {
    var textArray = isUser ? newPayload.input.text : newPayload.output.text;
    if (Object.prototype.toString.call( textArray ) !== '[object Array]') {
      textArray = [textArray];
    }
    var messageArray = [];

    textArray.forEach(function(currentText) {
      if (currentText) {
        var messageJson = {
          // <div class='segments'>
          'tagName': 'div',
          'classNames': ['segments'],
          'children': [{
            // <div class='from-user/from-watson latest'>
            'tagName': 'div',
            'classNames': [(isUser ? 'from-user' : 'from-watson'), 'latest', ((messageArray.length === 0) ? 'top' : 'sub')],
            'children': [{
              // <div class='message-inner'>
              'tagName': 'div',
              'classNames': ['message-inner'],
              'children': [{
                // <p>{messageText}</p>
                'tagName': 'p',
                'text': currentText
              }]
            }]
          }]
        };
        messageArray.push(Common.buildDomElement(messageJson));
      }
    });

    return messageArray;
  }

  // Scroll to the bottom of the chat window (to the most recent messages)
  // Note: this method will bring the most recent user message into view,
  //   even if the most recent message is from Watson.
  //   This is done so that the "context" of the conversation is maintained in the view,
  //   even if the Watson message is long.
  function scrollToChatBottom() {
    var scrollingChat = document.querySelector('#scrollingChat');

    // Scroll to the latest message sent by the user
    var scrollEl = scrollingChat.querySelector(settings.selectors.fromUser
            + settings.selectors.latest);
    if (scrollEl) {
      scrollingChat.scrollTop = scrollEl.offsetTop;
    }
  }

  // Handles the submission of input
  function inputKeyDown(event, inputBox) {
    // Submit on enter key, dis-allowing blank messages
      if (event.keyCode === 13 && inputBox.value) {
          // Retrieve the context from the previous server response

      var context;
      var latestResponse = Api.getResponsePayload();
      if (latestResponse) {
          context = latestResponse.context;

          if (context.CardViewFlag == 'on') {
              context.CardViewFlag = "";
          }
          if (context.GroupFlag == 'on') {
              context.GroupFlag = "";
          }
          if (context.HealthyFlag == 'on') {
              context.HealthyFlag = "";
          }
          if (context.TastyFlag == 'on') {
              context.TastyFlag = "";
          }
          if (context.NutsFlag == 'on') {
              context.NutsFlag = "";
          }
          if (context.BigBudgetFlag == 'on') {
              context.BigBudgetFlag = "";
          }
          if (context.CreamFlag == 'on') {
              context.CreamFlag = "";
          }
          if (context.CategoriesFlag != '') {
              context.CategoriesFlag = "";
          }
          if (context.productFlag != '')
          {
              context.productFlag = "";
          }
          if (context.Qprice != '') {
              context.Qprice = "";
          }
          if (context.Qrange != '') {
              context.Qrange = "";
          }
          if (context.Qproduct != '') {
              context.Qproduct = "";
          }
          if (context.Qprice2 != '') {
              context.Qprice2 = "";
          }
          if (context.SinglesFlag != '') {
              context.SinglesFlag = "";
          }
          if (context.LatestFlag != '') {
              context.LatestFlag = "";
          }
          if (context.BtnFlag != '') {
              context.BtnFlag = "";
          }
          if (context.BtnContent != '') {
              context.BtnContent = "";
          }
          if (context.ReviewFlag != '') {
              context.ReviewFlag = "";
          }
		   if (context.PromptFlag != '') {
              context.PromptFlag = "";
          }
		  if (context.ingredientFlag != '') {
              context.ingredientFlag = "";
          }
		  if (context.imageFlag != '') {
              context.imageFlag = "";
          }

      }

      // Send the user message
      Api.sendRequest(inputBox.value, context);

      // Clear input box for further messages
      inputBox.value = '';
      Common.fireEvent(inputBox, 'input');
      $(".btn-group").last().hide();
	  displayAnimation();
    }
  }

  //Create Animation While Completion of DOM appending to the chat Chat_column
  function displayAnimation(){
    var componentDOM = buildAnimation();
    var chatBox = document.querySelector(settings.selectors.chatBox);
    chatBox.appendChild(componentDOM);
  }

}());
