function run() {
    document.getElementById("login").onclick = function () {
        login();
    };
    document.getElementById("logout-button").onclick = function () {
        chrome.storage.sync.clear(function () {
            document.getElementById('login-container').style.display = 'block';
            document.getElementById('logout-button').style.display = 'none';
            document.getElementById("login").disabled = false;

        });
    };
    chrome.storage.sync.get('user', function (obj) {
        if (obj.user != null) {
            console.log('wot');
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('logout-button').style.display = 'block';
        }
    });

}


function login() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    document.getElementById("login").disabled = true;
    var url = "http://crypt.dev/api/users/login";
    var params = "email=" + email + "&password=" + password;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
        if (this.status == 200) {
            chrome.storage.sync.clear();
            var response = JSON.parse(this.response);
            chrome.storage.sync.set({'token': response.token, 'user': response.user}, function () {
                document.getElementById('login-container').style.display = 'none';
                document.getElementById('logout-button').style.display = 'block';
                window.location = '/popup.html'
            });


        }
    };
    xhr.send(params);
}


run();
