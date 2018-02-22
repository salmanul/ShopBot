
/* global ConversationPanel: true, PayloadPanel: true*/
/* eslint no-unused-vars: "off" */

// Other JS files required to be loaded first: apis.js, conversation.js, payload.js

(function() {
  // Initialize all modules
  ConversationPanel.init();
  PayloadPanel.init();
})();

var data1;
var count = 0;
var lengthOfimages;

//Cardview DOM Element Building Function
var cardView = {
    imageSource:'',
    jsonSource:'',
    flagForHideBtn:false,
	flagForHideBubbles:false,
    buildView: function () {

        //Main Div Element
        var box = document.getElementById('scrollingChat');
        var mainDiv = document.createElement('DIV');
        mainDiv.setAttribute('id', 'mainCard');

        mainDiv.setAttribute('onmouseenter', 'mouseover(this)');

        //Button 1
        var b1 = document.createElement('BUTTON');
        b1.setAttribute('type', 'button');
        b1.setAttribute('value', 'pre');
        b1.setAttribute('class', 'btn btn-default waves-effect waves-light');
        b1.setAttribute('onclick', 'changeImage(this)');
		b1.setAttribute('id','card-btn-1');
        //b1.setAttribute('style', '');
            var iTag = document.createElement('I');
            iTag.setAttribute('class', 'fa fa-chevron-left');
            iTag.setAttribute('aria-hidden', 'true');
            iTag.setAttribute('style', 'font-size: 2rem;margin-left:5px;color: #716aca;-webkit-text-stroke: 4px white;');
            b1.appendChild(iTag);

        //Button 2
        var b2 = document.createElement('BUTTON');
        b2.setAttribute('type', 'button');
        b2.setAttribute('value', 'nex');
        b2.setAttribute('class', 'btn btn-default waves-effect waves-light');
        b2.setAttribute('onclick', 'changeImage(this)');
		b2.setAttribute('id','card-btn-2');
        //b2.setAttribute('style', '');
            var iTag2 = document.createElement('I');
            iTag2.setAttribute('class', 'fa fa-chevron-right');
            iTag2.setAttribute('aria-hidden', 'true');
            iTag2.setAttribute('style', 'font-size: 2rem;margin-left:7px;color:#716aca;-webkit-text-stroke: 4px white;');
            b2.appendChild(iTag2);

            if (cardView.flagForHideBtn == false)
        {
        mainDiv.appendChild(b1);
        mainDiv.appendChild(b2);
        }
            if (cardView.flagForHideBtn == true)
            {
                cardView.flagForHideBtn=false;
            }
        //Div for card with bubbles indication
        var div2 = document.createElement('DIV');
        div2.setAttribute('id', 'cardWithBubbles');
        div2.setAttribute('style', 'text-align:center;')

        var span = document.createElement('SPAN');
        span.setAttribute('id', 'card-bubbles');
		if(cardView.flagForHideBubbles == false)
		{
        mainDiv.appendChild(span);
		}
		if(cardView.flagForHideBubbles == true)
		{
			cardView.flagForHideBubbles = false;
		}


            //Div for Card
            var div = document.createElement('DIV');
            div.setAttribute('class', 'card');
            div.setAttribute('style', 'width:18rem;margin-bottom:0.1rem;margin-top:0.2rem;transition:opacity 1s linear;opacity:0;font-size: 14px;font-family: Poppins;box-shadow:none;');

            //Image in the Card
            var img1 = document.createElement('IMG');
            img1.setAttribute('id', 'imageBox');
            img1.setAttribute('class', 'card-img-top');
            img1.setAttribute('src',cardView.imageSource);
            img1.setAttribute('style', 'height:auto;');
            div.appendChild(img1);

            //Card Block for text
            var cardBlock = document.createElement('DIV');
            cardBlock.setAttribute('class', 'card-block');
            var h4 = document.createElement('H4');
            h4.setAttribute('class', 'card-title');
            h4.setAttribute('style', 'text-align:center;');



        //cardView.AjaxCall();

            h4.innerHTML = "Name";      //Product Name

        //Product Description Element
        var p = document.createElement('P');
        p.setAttribute('class', 'card-text show-read-more');
        p.setAttribute('style', 'text-align:center;');
        p.innerHTML = "description";
        cardBlock.appendChild(h4);
        cardBlock.appendChild(p);

        div.appendChild(cardBlock);

        //li1 and li2 for category and price
        var list = document.createElement('UL');
        list.setAttribute('class', 'list-group list-group-flush');
        var li1 = document.createElement('LI');
        li1.setAttribute('class', 'list-group-item');
        li1.innerHTML = 'Category : &nbsp;';
        var li2 = document.createElement('LI');
        li2.setAttribute('class', 'list-group-item');
        li2.innerHTML = 'Price : &nbsp;';
        list.appendChild(li1);
        list.appendChild(li2);

        div.appendChild(list);

        div2.appendChild(div);


        mainDiv.appendChild(div2);
        box.appendChild(mainDiv);

        window.getComputedStyle(mainDiv).opacity; // added
        div.style.opacity = 1;

        var FlagForBubble = false;

        //Get the information about products from corresponding JSON file
        cardView.AjaxCall(h4, p, li1, li2,FlagForBubble,span);

        box.scrollTop = box.scrollHeight - box.lastChild.scrollHeight;

    },
    AjaxCall: function ajaxCall(h4,p,li1,li2,FlagForBubble,span) {  //All card block elements updation
        $.get(cardView.jsonSource, function (data, status) {
            data1 = data;
            h4.innerHTML = data1.name;
            p.innerHTML = data1.description;
            li1.innerHTML = 'Category :&nbsp;<b>'+ data1.category+'</b>';
            li2.innerHTML = 'Price :&nbsp;<b>' + data1.price + '</b>';
            lengthOfimages = data1.length;
            if (FlagForBubble == false)
            {
                for (i = 0; i < lengthOfimages; i++) {
                    var iTag = document.createElement('I');
                    iTag.className = "fa fa-circle-thin";
                    iTag.setAttribute('aria-hidden', 'true');
                    span.appendChild(iTag);

                }
                var iTag3 = span.getElementsByTagName('i');
                iTag3[0].className = 'fa fa-circle';

                var box1 = document.getElementById('scrollingChat');

                box1.scrollTop = box1.scrollHeight - box1.lastChild.scrollHeight;

            }

            //Hide Large Paragraph from card view
            var maxLength = 100;
            $(".show-read-more").each(function () {
                var myStr = $(this).text();
                if ($.trim(myStr).length > maxLength) {
                    var newStr = myStr.substring(0, maxLength);
                    var removedStr = myStr.substring(maxLength, $.trim(myStr).length);
                    $(this).empty().html(newStr);
                    $(this).append(' <a href="javascript:void(0);" class="read-more">read more...</a>');
                    $(this).append('<span class="more-text">' + removedStr + '</span>');
                }
            });
            $(".read-more").click(function () {
                $(this).siblings(".more-text").contents().unwrap();
                $(this).remove();
            });
        });

    }


    }





var l = 1;
//Function to change images according to their value in button
function changeImage(x) {
    if (x.value == 'pre') {
        var img1 = cardobj.getElementsByTagName('img')[0];
        var currentPath = img1.src;
        var split = currentPath.split('/');
        var length = split.length - 1;

        l--;
        if (l < 1) {
            l = 1;
        }
        var newfile = l + '.jpg';
        split[length] = newfile;
        var newPath = split.join('/');

        img1.src = newPath;

        //Change Text for card title
        var CardTitle = cardobj.getElementsByTagName('h4')[0];
        var currentPathForText = img1.src;
        var splitForText = currentPathForText.split('/');
        var lengthForText = splitForText.length - 1;
        var newfileForText = l + '.json';
        splitForText[lengthForText] = newfileForText;
        var newPathForText = splitForText.join('/');
        cardView.jsonSource = newPathForText;
        //cardView.AjaxCall();
        //CardTitle.innerHTML = data1.name;

        //Change Description
        var CardDescription = cardobj.getElementsByTagName('p')[0];
        //CardDescription.innerHTML = data1.description;

        //Change Category
        var CardList1 = cardobj.getElementsByTagName('li')[0];
        //CardList1.innerHTML = 'Category : ' + data1.category;

        //Change Price
        var Cardlist2 = cardobj.getElementsByTagName('li')[1];
        //CardList1.innerHTML = 'Price : ' + data1.price;

        var span = cardobj.getElementsByTagName('span')[0];

        var FlagForBubble = true;
        cardView.AjaxCall(CardTitle, CardDescription, CardList1, Cardlist2, FlagForBubble);

        var iTag = span.getElementsByTagName('i');

        iTag[l - 1].className = 'fa fa-circle';
        iTag[l].className = 'fa fa-circle-thin';


        img1.style.opacity = 0;
        $(img1).animate({
            //width: "70%",
            opacity: 1
            //marginLeft: "0.6in",
            //fontSize: "3em",
            //borderWidth: "10px"
        }, 'slow');


    }
    if (x.value == 'nex') {

        //Change images
        var img1 = cardobj.getElementsByTagName('img')[0];
        var currentPath = img1.src;
        var split = currentPath.split('/');
        var length = split.length - 1;
        l++;
        if (l > lengthOfimages) {
            l = lengthOfimages;
        }
        var newfile = l + '.jpg';
        split[length] = newfile;
        var newPath = split.join('/');

        img1.src = newPath;

        //Change Text for card title
        var CardTitle = cardobj.getElementsByTagName('h4')[0];
        var currentPathForText = img1.src;
        var splitForText = currentPathForText.split('/');
        var lengthForText = splitForText.length - 1;
        var newfileForText = l + '.json';
        splitForText[lengthForText] = newfileForText;
        var newPathForText = splitForText.join('/');
        cardView.jsonSource = newPathForText;
        //cardView.AjaxCall();
        //CardTitle.innerHTML = data1.name;

        //Change Description
        var CardDescription = cardobj.getElementsByTagName('p')[0];
        //CardDescription.innerHTML = data1.description;

        //Change Category
        var CardList1 = cardobj.getElementsByTagName('li')[0];
        //CardList1.innerHTML = 'Category : ' + data1.category;

        //Change Price
        var Cardlist2 = cardobj.getElementsByTagName('li')[1];
        //CardList2.innerHTML = 'Price : ' + data1.price;

        var span = cardobj.getElementsByTagName('span')[0];
        var FlagForBubble = true;
        cardView.AjaxCall(CardTitle, CardDescription, CardList1, Cardlist2,FlagForBubble);

        var iTag = span.getElementsByTagName('i');
        iTag[l - 1].className = 'fa fa-circle';
        if (l >= 1) {
            iTag[(l - 2)].className = 'fa fa-circle-thin';
        }


        img1.style.opacity = 0;
        $(img1).animate({
            //width: "70%",
            opacity: 1
            //marginLeft: "0.6in",
            //fontSize: "3em",
            //borderWidth: "10px"
        }, 'slow');


    }
}

var cardobj;
//keep update each card view object when user enter
function mouseover(y)
{
    cardobj = y;
    var img1 = cardobj.getElementsByTagName('img')[0];
    var currentPath = img1.src;
    var split = currentPath.split('/');
    var length = split.length - 1;
    var newfileForLength = '1.json';
    split[length] = newfileForLength;
    var newPath = split.join('/');
    $.get(newPath, function (data, status) {

        lengthOfimages = data.length;
    });

}

//For card view of all categories of biscuits



//Function to build products card view




//On Click navigation of cards when clicked on each category in Categories card view of biscuits
function navigation(categoryCards)
{

    if(categoryCards.getAttribute('value')=='Healthy')
    {
        cardView.imageSource = 'img/images/categories/healthy/1.jpg';
        cardView.jsonSource = 'img/images/categories/healthy/1.json';
        cardView.buildView();

    }
    if (categoryCards.getAttribute('value') == 'Tasty') {
        cardView.imageSource = 'img/images/categories/tasty/1.jpg';
        cardView.jsonSource = 'img/images/categories/tasty/1.json';
        cardView.buildView();

    }
    if (categoryCards.getAttribute('value') == 'Cookies') {
        cardView.imageSource = 'img/images/categories/nuts/1.jpg';
        cardView.jsonSource = 'img/images/categories/nuts/1.json';
        cardView.buildView();

    }
    if (categoryCards.getAttribute('value') == 'Cream') {
        cardView.imageSource = 'img/images/categories/cream/1.jpg';
        cardView.jsonSource = 'img/images/categories/cream/1.json';
        cardView.buildView();

    }

}

//On Click For all images in products card view
function navigation2(ProductsCards)
{
    if(ProductsCards.getAttribute('value') == 'Aashirvaad')
    {
        cardView.imageSource = 'img/images/Aashirvaad/AashirvaadAtta/1.jpg';
        cardView.jsonSource = 'img/images/Aashirvaad/AashirvaadAtta/1.json';
        cardView.buildView();

    }
    if (ProductsCards.getAttribute('value') == 'Bingo')
    {
        cardView.imageSource = 'img/images/Bingo/1.jpg';
        cardView.jsonSource = 'img/images/Bingo/1.json';
        cardView.buildView();
    }
    if (ProductsCards.getAttribute('value') == 'Sunfeast')
    {
        cardViewCategory.buildViewC();
        var box = document.getElementById('scrollingChat');
        box.scrollTop = box.scrollHeight - box.lastChild.scrollHeight;
    }
    if (ProductsCards.getAttribute('value') == 'BNatural')
    {
        cardView.imageSource = 'img/images/BNaturals/1.jpg';
        cardView.jsonSource = 'img/images/BNaturals/1.json';
        cardView.buildView();
    }
    if (ProductsCards.getAttribute('value') == 'Yipee')
    {
        cardView.imageSource = 'img/images/Yipee/1.jpg';
        cardView.jsonSource = 'img/images/Yipee/1.json';
        cardView.buildView()
    }



}

//For Connecting with DB
var Query = {
images:{},
img1:{},
h4:{},
p:{},
li1:{},
li2:{},
NavigationForQuery:function(){
Query.images = JSON.parse(Query.images);
var lengthI = Query.images.docs.length;

//if the result is empty,replay with 'no results'
if(lengthI === 0){

    var Chatwindow = document.getElementById('scrollingChat');

    var ResultNotFound = '<div class="segments load"></div>';
    var DivForSegment = document.createElement('DIV');
    DivForSegment.setAttribute('class','segments load');
    DivForSegment.innerHTML = '<div class="from-watson latest top"><div class="message-inner"><p>No Results Found</p></div></div>';

    Chatwindow.appendChild(DivForSegment);

console.log('Not Found Any products');
}

// if the result from DB have values - 'Display Result'
if(lengthI != 0)
{
    var box = document.getElementById('scrollingChat');
    var mainDiv = document.createElement('DIV');
    mainDiv.setAttribute('id', 'mainCard');
    //mainDiv.setAttribute('style', 'display:flex;flex-direction:row;align-items:center;margin-top:2rem;');


    var b1 = document.createElement('BUTTON');
    b1.setAttribute('type', 'button');
    b1.setAttribute('value', 'pre');
    b1.setAttribute('class', 'btn btn-default waves-effect waves-light');
    b1.setAttribute('onclick', 'Query.changeImage3(this)');
	b1.setAttribute('id','card-btn-1');
    //b1.setAttribute('style', 'padding-left: 0.5rem;padding-top:1rem;border-radius: 20px;background:#DEDEDE;width:40px;height:40px;padding-right:2rem;');

			var iTag = document.createElement('I');
            iTag.setAttribute('class', 'fa fa-chevron-left');
            iTag.setAttribute('aria-hidden', 'true');
            iTag.setAttribute('style', 'font-size: 2rem;margin-left:5px;color: #716aca;-webkit-text-stroke: 4px white;');
            b1.appendChild(iTag);


    var b2 = document.createElement('BUTTON');
    b2.setAttribute('type', 'button');
    b2.setAttribute('value', 'nex');
    b2.setAttribute('class', 'btn btn-default waves-effect waves-light');
    b2.setAttribute('onclick', 'Query.changeImage3(this)');
	b2.setAttribute('id','card-btn-2');
    //b2.setAttribute('style', 'order:3;padding-left: 0.5rem;padding-top:1rem;border-radius:20px;background:#DEDEDE;width:40px;height:40px;padding-right:2rem;');

			var iTag2 = document.createElement('I');
            iTag2.setAttribute('class', 'fa fa-chevron-right');
            iTag2.setAttribute('aria-hidden', 'true');
            iTag2.setAttribute('style', 'font-size: 2rem;margin-left:7px;color:#716aca;-webkit-text-stroke: 4px white;');
            b2.appendChild(iTag2);


    mainDiv.appendChild(b1);
    mainDiv.appendChild(b2);

	var div2 = document.createElement('DIV');
    div2.setAttribute('id', 'cardWithBubbles');
    div2.setAttribute('style', 'text-align:center;')

        var span = document.createElement('SPAN');
        span.setAttribute('id', 'card-bubbles');

		//mainDiv.appendChild(span);

    var div = document.createElement('DIV');
    div.setAttribute('class', 'card');
    div.setAttribute('style', 'width:18rem;margin-bottom:0.1rem;margin-top:0.2rem;transition:opacity 1s linear;opacity:0;font-size: 14px;font-family: Poppins;box-shadow:none;');

    Query.img1 = document.createElement('IMG');
    Query.img1.setAttribute('id', 'imageBox');
    Query.img1.setAttribute('class', 'card-img-top');
    Query.img1.setAttribute('src', Query.images.docs[0].image_path);
    Query.img1.setAttribute('style', 'height:auto;');
    div.appendChild(Query.img1);
    var cardBlock = document.createElement('DIV');
    cardBlock.setAttribute('class', 'card-block');
    Query.h4 = document.createElement('H4');
    Query.h4.setAttribute('class', 'card-title');
    Query.h4.setAttribute('style', 'text-align:center;');



    //cardView.AjaxCall();

    Query.h4.innerHTML = "Name";


    Query.p = document.createElement('P');
    Query.p.setAttribute('class', 'card-text show-read-more');
    Query.p.setAttribute('style', 'text-align:center;');
    Query.p.innerHTML = "description";
    cardBlock.appendChild(Query.h4);
    cardBlock.appendChild(Query.p);

    div.appendChild(cardBlock);

    var list = document.createElement('UL');
    list.setAttribute('class', 'list-group list-group-flush');
    Query.li1 = document.createElement('LI');
    Query.li1.setAttribute('class', 'list-group-item');
    Query.li1.innerHTML = 'Category : ';
    Query.li2 = document.createElement('LI');
    Query.li2.setAttribute('class', 'list-group-item');
    Query.li2.innerHTML = 'Price : ';
    list.appendChild(Query.li1);
    list.appendChild(Query.li2);

    div.appendChild(list);

    div2.appendChild(div);


    mainDiv.appendChild(div2);
    box.appendChild(mainDiv);



    //get json from image path
    FirstImagePath = Query.images.docs[0].image_path;
    JSONfile = FirstImagePath.substr(0,FirstImagePath.lastIndexOf("."))+".json";
    //Ajax call for JSON file
    $.get(JSONfile, function (data, status) {
        Query.h4.innerHTML = data.name;
        Query.p.innerHTML = data.description;
        Query.li1.innerHTML = 'Category : <b>' + data.category + '</b>';
        Query.li2.innerHTML = 'Price : <b>' + data.price + '</b>';

        for (i = 0; i < Query.images.docs.length; i++) {
            var iTag = document.createElement('I');
            iTag.className = "fa fa-circle-thin";
            iTag.setAttribute('aria-hidden', 'true');
            span.appendChild(iTag);
        }
        var maxLength = 100;
        $(".show-read-more").each(function () {
            var myStr = $(this).text();
            if ($.trim(myStr).length > maxLength) {
                var newStr = myStr.substring(0, maxLength);
                var removedStr = myStr.substring(maxLength, $.trim(myStr).length);
                $(this).empty().html(newStr);
                $(this).append(' <a href="javascript:void(0);" class="read-more">read more...</a>');
                $(this).append('<span class="more-text">' + removedStr + '</span>');
            }
        });
        $(".read-more").click(function () {
            $(this).siblings(".more-text").contents().unwrap();
            $(this).remove();
        });
    });
    window.getComputedStyle(mainDiv).opacity; // added
    div.style.opacity = 1;
}
var box = document.getElementById('scrollingChat');
box.scrollTop = box.scrollHeight - box.lastChild.scrollHeight;

},

//For Changing Images of Displayed Query Results
changeImage3:function(t){
if (t.value == 'nex'){
    count++;
    if (count > Query.images.docs.length - 1) {
        count = Query.images.docs.length - 1;
    }
    Query.img1.setAttribute('src', Query.images.docs[count].image_path);

    ImagePath = Query.images.docs[count].image_path;
    JSONfile = ImagePath.substr(0, ImagePath.lastIndexOf(".")) + ".json";
    $.get(JSONfile, function (data, status) {
        Query.h4.innerHTML = data.name;
        Query.p.innerHTML = data.description;
        Query.li1.innerHTML = 'Category : <b>' + data.category + '</b>';
        Query.li2.innerHTML = 'Price : <b>' + data.price + '</b>';
        //For make read more option in paragraph
        var maxLength = 100;
        $(".show-read-more").each(function () {
            var myStr = $(this).text();
            if ($.trim(myStr).length > maxLength) {
                var newStr = myStr.substring(0, maxLength);
                var removedStr = myStr.substring(maxLength, $.trim(myStr).length);
                $(this).empty().html(newStr);
                $(this).append(' <a href="javascript:void(0);" class="read-more">read more...</a>');
                $(this).append('<span class="more-text">' + removedStr + '</span>');
            }
        });
        $(".read-more").click(function () {
            $(this).siblings(".more-text").contents().unwrap();
            $(this).remove();
        });
        });


}
if (t.value == 'pre'){
count--;
    Query.img1.setAttribute('src', Query.images.docs[count].image_path);
    ImagePath = Query.images.docs[count].image_path;
    JSONfile = ImagePath.substr(0, ImagePath.lastIndexOf(".")) + ".json";

    $.get(JSONfile, function (data, status) {
        Query.h4.innerHTML = data.name;
        Query.p.innerHTML = data.description;
        Query.li1.innerHTML = 'Category : <b>' + data.category + '</b>';
        Query.li2.innerHTML = 'Price : <b>' + data.price + '</b>';

        //For make read more option in paragraph
        var maxLength = 100;
        $(".show-read-more").each(function () {
            var myStr = $(this).text();
            if ($.trim(myStr).length > maxLength) {
                var newStr = myStr.substring(0, maxLength);
                var removedStr = myStr.substring(maxLength, $.trim(myStr).length);
                $(this).empty().html(newStr);
                $(this).append(' <a href="javascript:void(0);" class="read-more">read more...</a>');
                $(this).append('<span class="more-text">' + removedStr + '</span>');
            }
        });
        $(".read-more").click(function () {
            $(this).siblings(".more-text").contents().unwrap();
            $(this).remove();
        });
    });

    if (count < 1)
    {
        count = 1;
    }

}
}
};

//For Dynamic Input  Submission
function submitInput(btn)
{
        $("input").focus();
        var e = jQuery.Event("keydown");
        e.keyCode = 13; // # Some key code value
        //ConversationPanel.inputKeyDown(e,btn)
       $("input").val(btn.value);
       $("input").trigger(e);

        //$("#buttons-group-view").hide();
       $(".btn-group").last().hide();
  }

  //DOM Building For Social Reviews
  var DomForSocialDetails = {

  DOMForFacebook:function(){
      var DivForFacebookPosts = document.createElement('DIV');
      DivForFacebookPosts.className = 'facebook-posts';
      DivForFacebookPosts.innerHTML = '<iframe src="//www.facebook.com/plugins/likebox.php?href=http%3A%2F%2Fwww.facebook.com%2FFarmlite&amp;width=1000&amp;height=450&amp;show_faces=false&amp;colorscheme=light&amp;stream=true&amp;show_border=false&amp;header=false" scrolling="no" style="border: none;overflow: hidden;width: 88%;height: 100%;margin: 1rem;" allowtransparency="true" frameborder="0"></iframe>';

      var box = document.getElementById('scrollingChat');
      box.append(DivForFacebookPosts);
      box.scrollTop = box.scrollHeight - box.lastChild.scrollHeight;
  },
  DOMForTwitter:function(){

      var DivForTwitterPosts = document.createElement('DIV');
      DivForTwitterPosts.className = 'twitter-posts';
      DivForTwitterPosts.innerHTML = '<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">If freedom from Maida is what you want to pursue, then switch to Farmlite as a <a href="https://twitter.com/hashtag/HealthierYouAwaitsYou?src=hash&amp;ref_src=twsrc%5Etfw">#HealthierYouAwaitsYou</a>. <a href="https://twitter.com/hashtag/HappyGandhiJayanti?src=hash&amp;ref_src=twsrc%5Etfw">#HappyGandhiJayanti</a> <a href="https://t.co/9KA6EoCayG">pic.twitter.com/9KA6EoCayG</a></p>&mdash; Sunfeast Farmlite (@farmlite) <a href="https://twitter.com/farmlite/status/914724737632399360?ref_src=twsrc%5Etfw">October 2, 2017</a></blockquote><a class="twitter-share-button"  href="https://twitter.com/intent/tweet" data-size="large">Tweet</a>';

      var box = document.getElementById('scrollingChat');
      box.append(DivForTwitterPosts);
	  twttr.widgets.load(document.getElementsByClassName("twitter-posts"));
      box.scrollTop = box.scrollHeight - box.lastChild.scrollHeight;
  }
  };

  //Time Format Correction
function formatAMPM(date) {
    var elem = document.getElementById("para1");
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function buildAnimation(){
  var animation_holder = document.createElement('DIV');
  animation_holder.className = 'animation_holder';
  animation_holder.innerHTML="<div class='container'><div class='loader'><div class='loader--dot'></div><div class='loader--dot'></div><div class='loader--dot'></div><div class='loader--dot'></div><div class='loader--dot'></div><div class='loader--dot'></div></div></div>";
  return animation_holder;
}
