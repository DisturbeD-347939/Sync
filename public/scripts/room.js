var player;
var username = prompt("What is your username?");
var date = new Date();


if(username)
{
    $(function()
    {

        /**************************SOCKET CONTROL*********************************/

        var socket = io();

        socket.emit('setup', {username: username, id: id});

        socket.on('chat message', function(msg)
        {
            $('#messages').append($('<li>').text(msg));
            $("#chatWindow").scrollTop($('#chatWindow').prop('scrollHeight'));
        });

        socket.on('disconnected', function(msg)
        {
            console.log(msg);
            $('#messages').append($('<li class="disconnect">').text(msg));
        })

        socket.on('video time', function(data)
        {
            var video_time = data["video_time"];
            var timestamp = data["timestamp"];
            video_time += Math.trunc(Date.now()/1000 - timestamp/1000);
            if(Math.trunc(player.getCurrentTime()) <= video_time - 2 || Math.trunc(player.getCurrentTime()) >= video_time + 2)
            {
                player.seekTo(video_time);
                player.playVideo();
            }
        })

        socket.on('video URL', function(url)
        {
            player.loadVideoById(reverseString(url));
        })

        /***************************PLAYER CONTROLS*****************************/

        if(player)
        {
    
            socket.on('pause', function()
            {
                player.pauseVideo();
            })
    
            socket.on('play', function()
            {
                player.playVideo();
            })
    
            socket.on('unstarted', function()
            {
                player.stopVideo();
            })
    
            socket.on('end', function()
            {
                player.stopVideo();
            })
        }

        /********************************FORM SUBMISSIONS**********************************/

        $("#sendMessage").click(function()
        {
            $('#messageForm').submit();
        })

        $("#sendVideo").click(function()
        {
            $("#chooseVideo").submit();
        })

        $('#messageForm').submit(function(e)
        {
            e.preventDefault();
            if($("#m").val() != " " && $("#m").val() != "\n")
            {
                socket.emit('chat message', $('#m').val());
            }
            $('#m').val('');
            return false;
        })

        $('#chooseVideo').submit(function(e)
        {
            e.preventDefault();

            var url = reverseString($('#videoURL').val());
            var videoID = "";

            for(var i = 0; i < url.length; i++)
            {
                if(url[i] != "=")
                {
                    videoID += url[i];
                }
                else
                {
                    break;
                }
            }

            player.loadVideoById(reverseString(videoID));
            console.log("Emitting video url -> " + videoID);
            socket.emit('video URL', videoID);
            
            return false;
        })

        //TIME SYNCHING

        setInterval(function()
        {
            if(username == "admin")
            {
                socket.emit('video time', {video_time: Math.trunc(player.getCurrentTime()), timestamp: Date.now()})
            }

        }, 1000);

        setInterval(function()
        {
            if(player)
            {
                if(player.getCurrentTime())
                {
                    $('#duration').html(Math.trunc(player.getCurrentTime()));
                    $('#videoSlider').attr("value", player.getCurrentTime());
                    $('#sliderP').html(player.getCurrentTime());
                }
                $('#videoSlider').attr("max", player.getDuration());
            }
        })

        //YOUTUBE PLAYER
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubePlayerAPIReady = function() 
        {
            player = new YT.Player('ytplayer', 
            {
              height: '360',
              width: '640',
              videoId: 'M7lc1UVf-VE',
              controls: false,
              events: 
              {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
              }
            });
        }

        function onPlayerReady(event) 
        {
            event.target.playVideo();

            $('#videoSlider').attr("max", event.target.getDuration());

            //$('#volumeSlider').attr("value", event.target.getVolume());
            event.target.setVolume($('#volumeSlider').attr("value"));
            $('#volumeP').html(volumeSlider.value);
        }

        function onPlayerStateChange(event)
        {
            console.log(event.target.getPlayerState());
            socket.emit('state', {state:event.target.getPlayerState(), username: username});
        }

        //SLIDERS
        var volumeSlider = document.getElementById("volumeSlider");
        var videoSlider = document.getElementById("videoSlider");

        volumeSlider.oninput = function()
        {
            $('#volumeP').html(volumeSlider.value);
            player.setVolume(volumeSlider.value);
        }

        videoSlider.oninput = function()
        {
            player.seekTo(videoSlider.value);
            debounce(function()
            {
                socket.emit('video time', {video_time: Math.trunc(player.getCurrentTime()), timestamp: Date.now()});
            }, 200);
        }

        $('#play').click(function()
        {
            console.log("Clicked");
            console.log(player.getPlayerState());
            if(player.getPlayerState() == 1)
            {
                player.pauseVideo();
            }
            else
            {
                player.playVideo();
            }
        })

    })
}

function reverseString(string)
{
    var splitString = string.split("");
    var reverseArray = splitString.reverse();
    var joinArray = reverseArray.join("");

    return joinArray;
}

function debounce(func, wait, immediate) 
{
	var timeout;
    return function() 
    {
		var context = this, args = arguments;
        var later = function() 
        {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};