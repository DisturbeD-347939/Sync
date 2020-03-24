$(document).ready(function()
{
    $('#createRoom').click(function()
    {
        generateString = Math.random().toString(36).substr(2, 9);
        var url = "http://localhost:3000/room/" + generateString;
        console.log(url);
        window.location.href = url;
    })

    function update()
    {
        console.log($('#indexContent').height());
        $('#indexContent').height(($('#indexBody').height()*60)/100);
    }

    setTimeout(update(), 0);
    setInterval(update(), 2000);
})