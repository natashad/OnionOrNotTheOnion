var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("get", url, true);
    xhr.responseType = "json";
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };
    xhr.send();
};

var subreddits = ["theonion", "nottheonion"];
var getNextArticle = function(callback) {
    var randomIndex = Math.floor(Math.random() + 0.5);
    var subreddit = subreddits[randomIndex];
    var subredditURL = "http://www.reddit.com/r/"+subreddit+"/random.json";
    var returnObj = {
        "title": "ERROR",
        "url": "ERROR",
        "source": subreddit
    }
    getJSON(subredditURL, function(err, data) {
        if (err != null) {
            console.log("Something went wrong: " + err);
            return returnObj;
        } else {

            var partial_data = data[0]['data']['children'][0]['data'];

            var title = partial_data['title'];
            var url = partial_data['url'];

            returnObj['title'] = title;
            returnObj['url'] = url;
            callback(returnObj);

        }
    });
}

myApp = new Vue({
    el: "#app",
    data: {
        title: '',
        link: '',
        source: '',
        userSelection: '',
        userCorrect: false,
        roundOver: false,
        total: 0,
        score: 0,
    },
    methods: {
        makeUserSelection: function(selection) {
            this.userSelection = selection;
            this.roundOver = true;
            this.userCorrect = (this.source == selection);
            if (this.userCorrect) this.score++;
            this.total++;
        },
        getNext: function() {
            var vm = this;
            article = getNextArticle(function(article) {
                vm.userSelection = '';
                vm.roundOver = false;
                vm.title = article['title'];
                vm.link = article['url'];
                vm.source = article['source'];
            });
            
        },
    },
    computed: {
    },
    

});


getNextArticle(function(first_article) {
    myApp.title=first_article['title'];
    myApp.link=first_article['url'];
    myApp.source=first_article['source'];
});

