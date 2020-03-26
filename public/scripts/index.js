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

    function update()
    {
        console.log($('#indexContent').height());
        $('#indexContent').height(($('#indexBody').height()*60)/100);
    }

    setTimeout(update(), 0);
    setInterval(update(), 2000);
})