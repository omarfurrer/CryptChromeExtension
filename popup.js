// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//$(function () {
/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function (tabs) {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        var tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        var url = tab.url;

        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        console.assert(typeof url == 'string', 'tab.url should be a string');

        callback(url);
    });
}

chrome.storage.sync.get('token', function (obj) {
    if (obj.token == null) {
        document.getElementById('crypt-form-container').style.display = 'none';
        document.getElementById('token-not-set-message').style.display = 'block';
    } else {
        getCurrentTabUrl(applyToForm);
        var url = "http://crypt.dev/api/folders";
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + JSON.stringify(obj.token));
        xhr.onload = function () {
            if (this.status == 200) {
                var response = JSON.parse(this.response);
                console.log(response);
                var select = document.getElementById('folder_id');
                for (var i = 0; i < response.folders.length; i++) {
                    var opt = document.createElement('option');
                    opt.value = response.folders[i].id;
                    opt.innerHTML = response.folders[i].name;
                    select.appendChild(opt);
                }
            }
        };
        xhr.send();
    }
});

function applyToForm(url) {
    document.getElementById('url').value = url;
    document.getElementById('user_id').value = 1;
    document.getElementById("send").onclick = function () {
        send(url);
    };
}

function send(url) {
//    var url = document.getElementById('url').value;
    crypt(url);
}

function crypt(bookmark_url) {
    chrome.storage.sync.get('token', function (obj) {
        document.getElementById("send").disabled = true;
        var url = "http://crypt.dev/api/bookmarks";
        var security_clearance = document.getElementById("security_clearance").value;
        var select = document.getElementById("folder_id");
        var folder_id = select.options[select.selectedIndex].value;
        var params = "url=" + bookmark_url + "&security_clearance=" + security_clearance;
        if (folder_id != '') {
            params += "&folder_id=" + folder_id;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('Authorization', 'Bearer ' + JSON.stringify(obj.token));
        xhr.onload = function () {
            if (this.status == 200) {
                window.close();
            }
        };
        xhr.send(params);
    });

}

//
///**
// * @param {string} searchTerm - Search term for Google Image search.
// * @param {function(string,number,number)} callback - Called when an image has
// *   been found. The callback gets the URL, width and height of the image.
// * @param {function(string)} errorCallback - Called when the image is not found.
// *   The callback gets a string that describes the failure reason.
// */
//function getImageUrl(searchTerm, callback, errorCallback) {
//    // Google image search - 100 searches per day.
//    // https://developers.google.com/image-search/
//    var searchUrl = 'https://ajax.googleapis.com/ajax/services/search/images' +
//            '?v=1.0&q=' + encodeURIComponent(searchTerm);
//    var x = new XMLHttpRequest();
//    x.open('GET', searchUrl);
//    // The Google image search API responds with JSON, so let Chrome parse it.
//    x.responseType = 'json';
//    x.onload = function () {
//        // Parse and process the response from Google Image Search.
//        var response = x.response;
//        if (!response || !response.responseData || !response.responseData.results ||
//                response.responseData.results.length === 0) {
//            errorCallback('No response from Google Image search!');
//            return;
//        }
//        var firstResult = response.responseData.results[0];
//        // Take the thumbnail instead of the full image to get an approximately
//        // consistent image size.
//        var imageUrl = firstResult.tbUrl;
//        var width = parseInt(firstResult.tbWidth);
//        var height = parseInt(firstResult.tbHeight);
//        console.assert(
//                typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
//                'Unexpected respose from the Google Image Search API!');
//        callback(imageUrl, width, height);
//    };
//    x.onerror = function () {
//        errorCallback('Network error.');
//    };
//    x.send();
//}
//
//function renderStatus(statusText) {
//    document.getElementById('status').textContent = statusText;
//}
//
//document.addEventListener('DOMContentLoaded', function () {
//    getCurrentTabUrl(function (url) {
//        // Put the image URL in Google search.
//        renderStatus('Performing Google Image search for ' + url);
//        
//        getImageUrl(url, function (imageUrl, width, height) {
//            
//            renderStatus('Search term: ' + url + '\n' +
//                    'Google image search result: ' + imageUrl);
//            var imageResult = document.getElementById('image-result');
//            // Explicitly set the width/height to minimize the number of reflows. For
//            // a single image, this does not matter, but if you're going to embed
//            // multiple external images in your page, then the absence of width/height
//            // attributes causes the popup to resize multiple times.
//            imageResult.width = width;
//            imageResult.height = height;
//            imageResult.src = imageUrl;
//            imageResult.hidden = false;
//            
//        }, function (errorMessage) {
//            renderStatus('Cannot display image. ' + errorMessage);
//        });
//    });
//});
//function onClick() {
//    chrome.browserAction.onClicked.addListener(function (tab) {
//        alert(tab.url);
//    });
//}
//});