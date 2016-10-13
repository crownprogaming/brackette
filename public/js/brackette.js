$(function(){

    $('#homePage').click(function(){
        console.log("Yay");
        window.location.href = "/";
    });

    console.log("Running");
    //not that smart but it's only a few vields so
    $('inline-edit').on("focusout", function(e){
        e.preventDefault();
        $.ajax({
            url: '/profile/update',
            type: 'POST',
            dataType: 'json',
            data: $('#name').value,
            cache: false,
            timeout: 5000,
            success: function(data){
                console.log("In essence we would update the front end.");
            },
            error: function(){
                console.log("Somethign bad happened. RIP");
            }
        });
    });
});