$(function () {
  $('#homePage').click(function () {
    console.log('Yay');
    window.location.href = '/';
  });

  console.log('Running');
    // not that smart but it's only a few vields so
  $('#name').on('focusout', function (e) {
    e.preventDefault();
    $.ajax({
      url: '/profile/update',
      type: 'POST',
      dataType: 'json',
      data: {name: this.value},
      cache: false,
      timeout: 5000,
      success: function (data) {
        console.log('In essence we would update the front end.');
      },
      error: function () {
        console.log('Somethign bad happened. RIP');
      }
    });
  });

  $('#gamertag').on('focusout', function (e) {
    e.preventDefault();
    $.ajax({
      url: '/profile/update',
      type: 'POST',
      dataType: 'json',
      data: {gamerTag: this.value},
      cache: false,
      timeout: 5000,
      success: function (data) {
        console.log('Success.');
      },
      error: function () {
        console.error('Somethign bad happened. RIP');
      }
    });
  });
});
