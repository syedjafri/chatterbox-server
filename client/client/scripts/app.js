// YOUR CODE HERE:


var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}


var app = {
  allMessages: {},
  roomList: {},
  username: window.location.search.slice(10),
  currentRoom: "allRooms",
  friends: {}
};

app.init = function(){
  app.server = 'http://127.0.0.1:3000/classes/messages/';

  app.fetch();
  setInterval(app.fetch, 5000);
};

app.send = function(message){
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server, // app.server
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json', // ??
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};

app.fetch = function() {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'GET',
    success: function (data) {
      for (var i = 0; i < data.results.length; i++) {
        var message = data.results[i];
        if(!app.allMessages.hasOwnProperty(message.objectId)){
          app.allMessages[message.objectId] = message;
          if(!app.roomList.hasOwnProperty(message.roomname)) {
            app.addRoom(message.roomname);
          }
        }
      }
      app.updatesMessages();
    },
    error: function (textStatus, errorThrown) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('Failed to fetch: ' + errorThrown);
    }
  });
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.updatesMessages = function(){
  app.clearMessages();
  var filteredMessages = _.filter(app.allMessages, function(val){
    return app.currentRoom === val.roomname;
  });
  for (var i = 0; i < filteredMessages.length; i++) {
    app.addMessage(filteredMessages[i]);
  }
};

app.addMessage = function(message){
  var escapedUsername = escapeHtml(message.username);
  var escapedMessage = escapeHtml(message.text);
  $('#chats').prepend('<div class="message-block"><span class="username">' + escapedUsername + '</span>: <span class="message">' + escapedMessage + '</span></div>');
  if (app.friends.hasOwnProperty(escapedUsername) ) {
    app.boldFriends(escapedUsername);
  }
};

app.addRoom = function(roomName){
  app.roomList[roomName] = roomName;
  if ($('#room-select').children().length === 1){
    $('#room-select').append('<option selected="selected" value=' + roomName + '>' + roomName + '</option>');
    app.currentRoom = roomName;
  } else {
    $('#room-select').append('<option value=' + roomName + '>' + roomName + '</option>');
  }
};

app.boldFriends = function(username) {
  $('.username:contains("' + username + '")').addClass("bold");
  // the "+" operator targets .message adjacent to the target .username
  $('.username:contains("' + username + '") + .message').addClass("bold");
};

app.addFriend = function(username) {
  app.friends[username] = username; // storing escaped username
  app.boldFriends(username);
};

$(document).on('click', '.submit', function() {
  var text = $('#message').val();
  $('#message').val('');
  var username = app.username;
  var roomname = $('#room-select').val();
  var message = {
    text: text,
    username: username,
    roomname: roomname
  };
  app.send(message);
});

$(document).on('change', '#room-select', function(){
  if ($('#room-select').val() === "Add Room...") {
    var newRoom = prompt("Enter a new room name");
    var escapedRoom = escapeHtml(newRoom);
    app.addRoom(escapedRoom);
    $('#room-select').val(escapedRoom);
  }
  app.currentRoom = $('#room-select').val();
  app.updatesMessages();
});

$(document).on('click', '.username', function() {
  var username = $(this).text();
  app.addFriend(username);
});

app.init();