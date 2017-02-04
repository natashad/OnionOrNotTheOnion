var GAME_ROUNDS = 10;
var TOTAL_COLLECTED = 100;
var THE_ONION = "theonion";
var NOT_THE_ONION = "nottheonion";
var URL_PREFFIX = "https://www.reddit.com/r/";
var URL_SUFFIX = "/new.json?limit=" + TOTAL_COLLECTED;
var onionResponse;
var notOnionResponse;
var allArticles = [];

myApp = new Vue({
    el: "#app",
    data: {
        title: '',
        link: '',
        source: '',
        userSelection: '',
        userCorrect: false,
        roundOver: false,
        currentRound: 0,
        score: 0,
        gameOver: false
    },
    methods: {
        makeUserSelection: function(selection) {
            this.userSelection = selection;
            this.roundOver = true;
            this.userCorrect = (this.source == selection);
            if (this.userCorrect) this.score++;
            this.currentRound++;
        },
        getNext: function() {
            if (this.currentRound == GAME_ROUNDS) {
                this.gameOver = true;
                return;
            }
            this.title = allArticles[this.currentRound]['title'];
            this.link = allArticles[this.currentRound]['url'];
            this.source = allArticles[this.currentRound]['source'];
            this.userSelection = '';
            this.roundOver = false;
        },
        startOver: function() {
            this.userSelection = '';
            this.roundOver = false;
            this.gameOver = false;
            this.score = 0;
            this.currentRound = 0;
            doSetUpAfterPromises();
        }
    },
    computed: {
    },
    

});

var getJSON = function(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.responseType = "json";
        xhr.onload = function() {
          var status = xhr.status;
          if (status == 200) {
            resolve(xhr.response);
          } else {
            reject(status);
          }
        };
        xhr.send();
    })
}


Promise.all([getJSON(URL_PREFFIX + THE_ONION + URL_SUFFIX), 
             getJSON(URL_PREFFIX + NOT_THE_ONION + URL_SUFFIX)])
             .then(function(results) {
    onionResponse = results[0];
    notOnionResponse = results[1];
    doSetUpAfterPromises();
}).catch(function(err) {
    console.log('Catch: ', err);
});



var getRandomInteger = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var filterArticles = function(responses, source, startsWithFilter="") {
    var filtered = [];
    var partials = responses['data']['children'];
    for (var i = 0; i < partials.length; i++) {
        var partial = partials[i]['data'];
        if (startsWithFilter && !partial['url'].startsWith(startsWithFilter)) {
            continue;
        }
        filtered.push({
            'title': partial['title'],
            'url': partial['url'],
            'source': source
        });
    }
    return filtered;
}

var doSetUpAfterPromises = function() {
    var usedIndices =[[],[]];
    var filteredArticles = 
        [filterArticles(onionResponse, THE_ONION, "http://www.theonion.com/article/"), 
         filterArticles(notOnionResponse, NOT_THE_ONION)];
    allArticles = [];
    for (var i =0; i < GAME_ROUNDS; i++) {

        //flip coin to pick which list
        var listInd = getRandomInteger(0,1);
        var chosenList = filteredArticles[listInd];
        var randomIndex = getRandomInteger(0, chosenList.length-1);
        while (usedIndices[listInd].includes(randomIndex)) {
            var randomIndex = getRandomInteger(0, chosenList.length-1);
        }
        usedIndices[listInd].push(randomIndex);
        allArticles.push(chosenList[randomIndex]);
    }

    myApp.title = allArticles[0]['title'];
    myApp.link = allArticles[0]['url'];
    myApp.source = allArticles[0]['source'];
}

