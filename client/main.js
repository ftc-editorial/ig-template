'use strict'
var oShare = require('ftc-share');

oShare.init();

$(function() {

/* variables*/
var $w = $(window);
var pageName = window.location.pathname;
var headerHeight = $('.header').height();
var viewportHeight = $(window).height() - headerHeight;
var $tocNav = $('.nav__toc').eq(0);

/* Show/Hide Navigation */
showHideNav($('.small-menu'), $('.nav__toc'));

backToTop($('.to-top'));

/* Generate navigation and deal with scrolled pagination */
var navLinks = generateNav($('.nav__toc'), $('.nav-target'));

var navTargetTops = getOffsetTop($('.nav-target')).toArray();

var wScrolledTop = $w.scrollTop();
var currentPage = onWhichPage(wScrolledTop, navTargetTops);
var previousPage = currentPage;
activeNavLink(currentPage, navLinks);
logPages(pageName, currentPage);

$w.on('scroll', function() {
	var wScrolledTop = $w.scrollTop();
	var currentPage = onWhichPage(wScrolledTop, navTargetTops);
	if (previousPage !== currentPage) {		
		previousPage = currentPage;
		activeNavLink(currentPage, navLinks);
		logPages(pageName, currentPage);
	}
});


});

function activeNavLink(currentPage, navLinks) {
	var currentNavLink = navLinks[currentPage - 1];
	currentNavLink.addClass('active');
	currentNavLink.siblings().removeClass('active');
}

function onWhichPage(x, arr) {
//Initially you are on the page 1.
	var j = 1;
	for (var i = 0; i < arr.length; i++) {
// If x > arr[i], you are on the page i+1.
		if (x >= arr[i]) {
			j = i+1;
		}
	}
	return j;
}

function logPages(pageName, pageNumber) {
	try {
	  ga('send', 'pageview', pageName + '?page=' + pageNumber);
	  fa('send', 'pageview', pageName + '?page=' + pageNumber);
	  ftcLog();
	} catch (ignore) {

	}	
}

function backToTop($elm) {
	$elm.on('click', function(e){
		e.preventDefault();
		$(window).scrollTo(0, 1000);
	});
}

function getOffsetTop($elms) {
	return $elms.map(function() {
		return $(this).offset().top;
	});
}

function generateNav($navContainer, $navTargets) {
	var navLinks = [];
	$navTargets.each(function(i) {
		var targetId = $(this).attr('id');
		var link = $('<a/>', {
			'href': '#' + targetId,
			'click': function(e) {
				e.preventDefault();
				$(window).scrollTo(document.getElementById(targetId), 300);
				$(e.target).addClass('active');
				$(e.target).siblings().removeClass('active');
			}
		}).text(i+1);

		$navContainer.append(link);
		navLinks.push(link);
	});	
	return navLinks;
}

function showHideNav($elm, $navContainer) {
	$('body').on('load click touch', function() {
		$navContainer.addClass('hide-on-small');
	});

	$elm.on('click touch', function(e) {
		$navContainer.toggleClass('hide-on-small');
		e.stopPropagation();
	});
}
