var Utils = {};

Utils.Date = function(){
	
	return {
		diff : function (date1, date2, datePart) {
			var diff = Math.abs(date1 - date2);
			switch (datePart) {
				case 's':
					return diff/1000;
				case 'm': 
					return diff/60000;
				case 'h':
					return diff/3600000;
				case 'd':
					return diff/86400000;
				default:
					throw new Error('Unknown datePart value %s', datePart);
			};
		},
	};
};