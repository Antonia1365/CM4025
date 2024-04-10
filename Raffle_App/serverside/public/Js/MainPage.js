$(document).ready(function(){

  var raffleItems = document.querySelectorAll('.raffleItem');
  var currentIndex = 0;

  function showRaffle(index) {
      // Hide all raffles
      raffleItems.forEach(function(item) {
        item.style.display = 'none';
      });

      // Show the raffle at the specified index
      raffleItems[index].style.display = 'block';
  }

  showRaffle(currentIndex);
  

  document.getElementById('NextRaffleBtn').addEventListener('click', function() {
      currentIndex = (currentIndex + 1) % raffleItems.length;
      showRaffle(currentIndex);
  });

  document.getElementById('PrevRaffleBtn').addEventListener('click', function() {
      currentIndex = (currentIndex - 1 + raffleItems.length) % raffleItems.length;
      showRaffle(currentIndex);
  });


  var raffleSignupDiv = document.getElementById("Create");
  var raffleListDiv = document.getElementById("RightBox");

  $('#ParticipateGuest').click(function() {
    
    if (raffleSignupDiv.style.display === "none") {

        raffleSignupDiv.style.display = "block";
        raffleListDiv.style.display = "none";
        $("#AccountLink").css("display", "none");
        $("#ParticipateGuest").css("display", "none");
        $('#RaffleSignup').attr('novalidate', 'true');
       
    } 
  
    
  });

  $('#ToggleParticipate').click(function() {
    if (raffleListDiv.style.display === "none") {
        raffleSignupDiv.style.display = "none";
        raffleListDiv.style.display = "flex";
        $("#AccountLink").css("display", "block");
        $("#ParticipateGuest").css("display", "block");
        $('#RaffleSignup').removeAttr('novalidate');
    }
  });
}); 

