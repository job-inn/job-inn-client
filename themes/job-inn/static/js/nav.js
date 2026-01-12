// show during scroll

// $(window).scroll(function() {
//   var scroll = $(window).scrollTop();

//   if (scroll >= 500) {
//       $(".menu").addClass("nav_mobile");
//   } else {
//       $(".menu").removeClass("nav_mobile");
//   }
// });

// flexnav

(function () {

  var navButton = document.querySelector("#menu-button");
  var navUl = document.querySelector(".nav");
  var navLink = document.querySelector(".nav");

  function toggleMobileMenu() {
    navUl.classList.toggle("hide");
  }

  function toggleMobileLink() {
    navUl.classList.toggle("hide");
  }

  navButton.onclick = toggleMobileMenu;

  navLink.onclick = toggleMobileLink;

}());
