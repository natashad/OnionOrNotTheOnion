var GAME_ROUNDS = 10;
var TOTAL_COLLECTED = 100;
var subreddits = ["theonion", "nottheonion"];
var url_prefix = "http://www.reddit.com/r/";
var url_suffix = "/new.json?limit=" + TOTAL_COLLECTED;
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

var onionPromise = new Promise(function(resolve, request) {
    var url = url_prefix+"theonion"+url_suffix;
    var xhr = new XMLHttpRequest();
    xhr.open("get", url, true);
    xhr.responseType = "json";
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        onionResponse = xhr.response;
        resolve("Success!");
      } else {
        reject("Failure");
      }
    };
    xhr.send();
});

var notOnionPromise = new Promise(function(resolve, request) {
    var url = url_prefix+"nottheonion"+url_suffix;
    var xhr = new XMLHttpRequest();
    xhr.open("get", url, true);
    xhr.responseType = "json";
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        notOnionResponse = xhr.response;
        resolve("Success!");
      } else {
        reject("Failure");
      }
    };
    xhr.send();
});

var getRandomNumber = function(max) {
    return Math.floor(Math.random()*max);
}

var filterOutOnionArticles = function(responses) {
    var filtered = [];
    var partials = responses['data']['children'];
    for (var i = 0; i < partials.length; i++) {
        if (partials[i]['data']['url'].startsWith("http://www.theonion.com/article/")) {
            filtered.push({
                'title': partials[i]['data']['title'],
                'url': partials[i]['data']['url'],
                'source': 'theonion'
            });
        }
    }
    return filtered;
}

var filterOutNotOnionArticles = function(responses) {
    var filtered = [];
    var partials = responses['data']['children'];
    for (var i = 0; i < partials.length; i++) {
        filtered.push({
            'title': partials[i]['data']['title'],
            'url': partials[i]['data']['url'],
            'source': 'nottheonion'
        });
    }
    return filtered;
}

var doSetUpAfterPromises = function() {
    var usedIndices =[[],[]];
    var filteredArticles = 
        [filterOutOnionArticles(onionResponse), filterOutNotOnionArticles(notOnionResponse)];
    for (var i =0; i < GAME_ROUNDS; i++) {

        //flip coin to pick which list
        var listInd = Math.floor(Math.random() + 0.5);
        var chosenList = filteredArticles[listInd];
        var randomIndex = getRandomNumber(chosenList.length);
        while (usedIndices[listInd].includes(randomIndex)) {
            var randomIndex = getRandomNumber(chosenList.length);
        }
        usedIndices[listInd].push(randomIndex);
        allArticles.push(chosenList[randomIndex]);
    }

    myApp.title = allArticles[0]['title'];
    myApp.link = allArticles[0]['url'];
    myApp.source = allArticles[0]['source'];
}

Promise.all([onionPromise, notOnionPromise]).then(function(results) {
    doSetUpAfterPromises();
}).catch(function(err) {
    console.log('Catch: ', err);
});


