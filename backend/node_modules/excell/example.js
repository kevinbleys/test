/* global Excell */
(function() {
	Array.from(document.querySelectorAll('.js-table')).forEach(function(elTable) {
		Excell.create({
			el: elTable,
		});
	});
})();
