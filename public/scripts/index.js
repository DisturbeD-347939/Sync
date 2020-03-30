$(document).ready(function()
{
    var socket = io();

    $('#indexRegister').hide();
    $('#indexLogin').hide();

    $('.createRoom').click(function()
    {
        generateString = Math.random().toString(36).substr(2, 9);
        var url = window.location.href + "room/" + generateString;
        console.log(url);
        window.location.href = url;
    })

    $('#register').click(function()
    {
        $('#indexButtons').hide();
        $('#indexRegister').show();
    })

    $('#login').click(function()
    {
        $('#indexButtons').hide();
        $('#indexLogin').show();
    })

    $('#submitRegister').click(function()
    {
        $('#indexRegister').submit();
    })

    $('#submitLogin').click(function()
    {
        $('#indexLogin').submit();
    })

    $('.back').click(function()
    {
        $('#indexButtons').show();
        $('#indexRegister').hide();
        $('#indexLogin').hide();

        $('.input-field > input').val("");
        $('.input-field > input').removeClass("valid");
        $('.input-field > input').removeClass("invalid");
        $('.input-field > label').removeClass("active");
        $('.input-field > span').text('');
        M.updateTextFields();
    })

    $('#indexRegister').submit(function(e)
    {
        e.preventDefault();
        console.log("Registering...");
        if($('#username').hasClass("valid") && $('#password').hasClass("valid") && $('#email').hasClass("valid"))
        {
            socket.emit('register', {username: $('#username').val(), email: $('#email').val(), password: $('#password').val()});
            console.log("All valid");
        }
        else
        {
            console.log("Some not valid");
        }
    })

    $('#indexLogin').submit(function(e)
    {
        e.preventDefault();
        
        if($('#emailLogin').hasClass("valid") && $('#passwordLogin').hasClass("valid"))
        {
            socket.emit('login', {email: $('#emailLogin').val(), password: $('#passwordLogin').val()});
            console.log("All valid");
        }
        else
        {
            console.log("Some not valid");
        }
        
    })
    
    socket.on('register', function(data)
    {
        console.log("Registering was " + data);
        if(data)
        {
            $('#indexFeedback').text("Account created!");
            $('#indexFeedback').css('color', "green");
            $('.back').click();
        }
        else
        {
            $('.input-field:first-child > input').val("");
            $('.input-field:first-child > input').removeClass("valid");
            $('.input-field:first-child > input').addClass("invalid");
            $('#emailFeedback').attr("data-error", "Email already in use! Try again.");
            M.updateTextFields();

            setTimeout(function()
            {
                $('.input-field:first-child > label').removeClass("active");
                $('.input-field:first-child > input').removeClass("invalid");
                $('#emailFeedback').attr("data-error", "Wrong email type");
            }, 2500);
        }
    })

    socket.on('login', function(data)
    {
        console.log(data);
        console.log("Login was " + data["login"]);
        if(data["login"])
        {
            $('#indexLogin').hide();
            $('#indexLoggedIn').show();
            $('#welcomeMessage').text("Welcome " + data["username"]);
        }
        else
        {
            $('#emailLogin').removeClass("valid");
            $('#emailLogin').addClass("invalid");
            $('#passwordLogin').removeClass("valid");
            $('#passwordLogin').addClass("invalid");
            $('.loginFeedback').attr("data-error", "Wrong email/password");
            M.updateTextFields();

            setTimeout(function()
            {
                $('#emailLogin').removeClass("invalid");
                $('#passwordLogin').removeClass("invalid");
                $('.loginFeedback').attr("data-error", "Wrong email type");
            }, 2500);
        }
    })

    function update()
    {
        console.log($('#indexContent').height());
        $('#indexContent').height(($('#indexBody').height()*70)/100);
    }

    setTimeout(update(), 0);
    setInterval(update(), 2000);
})