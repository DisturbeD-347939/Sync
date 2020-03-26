$(document).ready(function()
{
    var socket = io();

    $('#indexRegister').hide();
    $('#indexLogin').hide();

    $('#createRoom').click(function()
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
    function update()
    {
        console.log($('#indexContent').height());
        $('#indexContent').height(($('#indexBody').height()*60)/100);
    }

    setTimeout(update(), 0);
    setInterval(update(), 2000);
})