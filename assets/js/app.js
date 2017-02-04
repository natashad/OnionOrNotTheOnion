var GAME_ROUNDS = 10;
var TOTAL_COLLECTED = 100;
var THE_ONION = "theonion";
var NOT_THE_ONION = "nottheonion";
var url_prefix = "https://www.reddit.com/r/";
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

var onionPromise = new Promise(function(resolve, reject) {
    var url = url_prefix + THE_ONION + url_suffix;
    getJSON(url).then(function(data) {
        resolve(data);
    }, function() {
        reject("Failure");
    });
});

var notOnionPromise = new Promise(function(resolve, reject) {
    var url = url_prefix + NOT_THE_ONION + url_suffix;
    getJSON(url).then(function(data){
        resolve(data);
    }, function() {
        reject("Failure");
    });
});

var getRandomInteger = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var filterOutOnionArticles = function(responses) {
    var filtered = [];
    var partials = responses['data']['children'];
    for (var i = 0; i < partials.length; i++) {
        if (partials[i]['data']['url'].startsWith("http://www.theonion.com/article/")) {
            filtered.push({
                'title': partials[i]['data']['title'],
                'url': partials[i]['data']['url'],
                'source': THE_ONION
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
            'source': NOT_THE_ONION
        });
    }
    return filtered;
}

var doSetUpAfterPromises = function() {
    var usedIndices =[[],[]];
    var filteredArticles = 
        [filterOutOnionArticles(onionResponse), filterOutNotOnionArticles(notOnionResponse)];
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

Promise.all([onionPromise, notOnionPromise]).then(function(results) {
    onionResponse = results[0];
    notOnionResponse = results[1];
    doSetUpAfterPromises();
}).catch(function(err) {
    console.log('Catch: ', err);
});


