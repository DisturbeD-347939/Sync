$(document).ready(function()
{
    $('#createRoom').click(function()
    {
        generateString = Math.random().toString(36).substr(2, 9);
        var url = "http://localhost:3000/room/" + generateString;
        console.log(url);
        window.location.href = url;
    })
})