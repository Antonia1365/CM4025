$(document).ready(function(){

  // Function to toggle between login and signup forms
  $('#ToggleLoginSignup').click(function(){
    $('#Login').toggle();
    $('#Signup').toggle();
    $('#NameHint').toggle();
    $('#NameHintBox').toggle();
    $('#PassHint').toggle();
    $('#PassHintBox').toggle();
    $('#SubmitLogin').toggle();
    $('#SubmitCreate').toggle();

    // Toggle the text of the button
    var buttonText = $(this).text();
    if (buttonText === "Or Sign Up") {
        $(this).text("Or Log In");
        $('#Enter p').text("Sign Up"); 
    } else {
        $(this).text("Or Sign Up");
        $('#Enter p').text("Log In"); 
    }

  });

  // Function to handle form submission errors
  function handleFormErrors(forms) {
    // Check if any fields are empty
    var isEmpty = false;
    forms.each(function() {
      if ($.trim($(this).val()) == '') {
        $(this).attr('placeholder', "Required field"); 
        $(this).addClass('red');
        $(this).addClass('error');
        isEmpty = true;
      }
    });

    if (isEmpty) {
      // Keep the red color for 3 seconds
      setTimeout(function(){ 
        forms.removeClass("red");
        forms.removeClass("error");
        forms.eq(0).attr('placeholder', "Username:");
        forms.eq(1).attr('placeholder', "Email:"); 
        forms.eq(2).attr('placeholder', "Password:"); 
      }, 3000);
      return true;
    }

    return false;
  }

  // Function to handle form submission for creating account
  function createErrors(){  
    var forms = $("#Signup .createForms");
    var pass = forms.eq(2).val();
    var name = forms.eq(0).val();

    if (handleFormErrors(forms)) {
      return;
    }

    if (!forms.eq(0).checkValidity() || (name.length < 5) || (name.length > 25) ||
        (!name.match(/\d/)) || (!name.match(/[a-z]/)) ){
      forms.eq(0).addClass('error');
      setTimeout(function(){ 
        forms.eq(0).removeClass('error');
      }, 3000);
      return;
    }

    if (!forms.eq(1).checkValidity()){
      forms.eq(1).addClass('error');
      setTimeout(function(){ 
        forms.eq(1).removeClass('error');
      }, 3000);
      return;
    }

    if (!forms.eq(2).checkValidity() || (pass.length < 8) || (pass.length > 30) ||
        (!pass.match(/\d/)) || (!pass.match(/[A-Z]/)) || (!pass.match(/[a-z]/)) ){
      forms.eq(2).addClass('error');
      setTimeout(function(){ 
        forms.eq(2).removeClass('error');
      }, 3000);
      return;
    }

    // Successfully created message
    $("#Signup").css("visibility","hidden");
    $("#SubmitCreate").css("visibility","hidden");
    $("#AccountCreated").css("visibility","visible");
  }
  
  // Function to handle form submission for logging in
  function loginErrors(){  
    var forms = $("#Login .loginForms");
    var pass = forms.eq(1).val();
    var name = forms.eq(0).val();

    if (handleFormErrors(forms)) {
      return;
    }

    if (!forms.eq(0).checkValidity() || (name.length < 5) || (name.length > 25) ||
        (!name.match(/\d/)) || (!name.match(/[a-z]/)) ){
      forms.eq(0).addClass('error');
      setTimeout(function(){ 
        forms.eq(0).removeClass('error');
      }, 3000);
      return;
    }

    if (!forms.eq(1).checkValidity() || (pass.length < 8) || (pass.length > 30) ||
        (!pass.match(/\d/)) || (!pass.match(/[A-Z]/)) || (!pass.match(/[a-z]/)) ){
      forms.eq(1).addClass('error');
      setTimeout(function(){ 
        forms.eq(1).removeClass('error');
      }, 3000);
      return;
    }

    // Successful login message
    $("#Login").css("visibility","hidden");
    $("#LoggedIn").css("visibility","visible");
  }

  // Function to handle mouseover event for hint elements
  $(".Hint").mouseover(function(){
    $(this).next(".HintBox").css("visibility","visible");
  });

  // Function to handle mouseleave event for hint elements
  $(".Hint").mouseleave(function(){
    $(this).next(".HintBox").css("visibility","hidden");
  });

  // Create the Create/ Login buttons and apply the above written functions on click
  $('#SubmitCreate').click(createErrors); 
  $('#SubmitLogin').click(loginErrors);  

});
