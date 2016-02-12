/*eslint-env amd,node */
/**
 * @author Vladislav Churakov <pioneer32@mail.ru>
 * @module dateUtils
 */

/**
 * Table of contents:
 *
 *  YMDtoJD:         ( year [, month || 1 [, day || 1 ]] ) -> Number of Julian Day
 *  YWDoWtoJD:       ( year, week [, dow || 1 ] )          -> Number of Julian Day
 *  YDMtoISO_YW:     ( year [, month || 1 [, day || 1 ]] ) -> "2015-W05"
 *  YDMtoISO_YWD:    ( year [, month || 1 [, day || 1 ]] ) -> "2015-W05-2"
 *  YMDtoWeekNumber: ( year [, month || 1 [, day || 1 ]] ) -> Number of ISO8601 week in year
 *  YMDtoDayOfWeek:  ( year [, month || 1 [, day || 1 ]] ) -> Number of day in week (0 - Sunday, 1 - Monday ... 6 - Saturday)
 *
 *  HMtoMinutes:  ( hours [, minutes || 0 ] )                  -> Number of minutes from begin of day
 *  HMStoSeconds: ( hours [, minutes || 0 [, seconds || 0 ]] ) -> Number of seconds from begin of day
 *
 *  ISOtoJD:              "2015-W05-2|2015-W05|2015-01-26|2015-01|2015"     -> Number of Julian Day
 *  √ ISO_YMDtoDayOfWeek: "2015-01-26"                                      -> Number of day in week (0 - Sunday, 1 - Monday ... 6 - Saturday)
 *  ISO_HMStoPercents:    "10:00:00|10:00:10"                               -> Number percents from begin of day
 *  √ ISOtoADMonth:       "2015-01-26T...", "2015-01-26", "2015-01", "2015" -> Number of the month in AD (Anno Domini or A.D.)
 *  ISO_YMtoAbsMonth:     depricated, alias to ISOtoADMonth
 *
 *  √ ADMonthToISO_YM: Number of the month in AD (Anno Domini or A.D.) -> "2011-01"
 *  AbsMonthToISO_YM:  depricated, alias to ADMonthToISO_YM
 *  √ ADMonthToJD:     Number of the month in AD (Anno Domini or A.D.) -> Number of Julian Day of the first day of the month
 *  AbsMonthToJD:      depricated, alias to ADMonthToJD
 *
 *  √ minutesToISO_HM: Number of minutes from begin of day -> "10:00"
 *
 *  DateToJD:       Date -> Number of Julian Day
 *  DateToADMonth:  Date -> Number of the month in AD (Anno Domini or A.D.)
 *
 *  JDtoDate:       Number of Julian Day -> Date (new or mutate)
 *  JDtoISO_YMD:    Number of Julian Day -> "2015-01-26"
 *  JDtoISO_YM:     Number of Julian Day -> "2015-01"
 *  JDtoWeekNumber: Number of Julian Day -> Number of ISO8601 week in year
 *  √ JDtoYMD:      Number of Julian Day -> [ year, month, day ]
 *  √ JDtoADMonth:  Number of Julian Day -> Number of the month in AD (Anno Domini or A.D.)
 *  √ JDtoISO_YW:   Number of Julian Day -> "2015-W05"
 *
 *  DateToISO_YMD:   Date -> "2015-01-26"
 *  DateToISO_HM:    Date -> "10:00"
 *  DateToISO_HMS:   Date -> "10:00:00"
 *  √ DateToMinutes: Date -> Number of minutes from begin of day
 *
 */

/* eslint camelcase: 0 */

( function ( global, exports ) {
	"use strict";

	var
		name_   = 'dateTimeUtils'
		, deps_ = [ /*Dependencies*/ ]
		;

	function factory_ ( /*Dependencies*/ ) {

		var
			YMDtoDayOfWeek, YMDtoJD, YWDoWtoJD, YDMtoISO_YW, YMDtoWeekNumber
			, HMtoMinutes, HMStoSeconds
			, ISOtoADMonth
			, ADMonthToISO_YM, ADMonthToJD
			, JDtoYMD
			;

		/**
		 * Returns [ year, number of ISO8601 week, number of day in week ]
		 *
		 * @param {number} year  - number of year (i.e. 2012)
		 * @param {number} month - number of month (1 - january ... 12 - december)
		 * @param {number} day   - number of day in month (1...31)
		 * @return {number[]}
		 * @private
		 */
		function YMDtoYWd_ ( year, month, day ) {
			var
				tjd      = YMDtoJD( year, month, day )
				, fwjd   = YWDoWtoJD( year, 1 )
				, fwnyjd = YWDoWtoJD( year + 1, 1 )
				;
			if ( tjd >= fwnyjd ) {
				return [ year + 1, 1, 1 + ( tjd - fwnyjd ) % 7 ];
			} else {
				if ( tjd < fwjd ) fwjd = YWDoWtoJD( --year, 1 );
				return [ year, 1 + ( tjd - fwjd ) / 7 >> 0, 1 + ( tjd - fwjd ) % 7 ];
			}
		}

		/**
		 * @param {number} n
		 * @return {string}
		 * @private
		 */
		function pad_ ( n ) {
			return n < 10 ? '0' + n : n + '';
		}

		/**
		 * Converts number of Julian Day to [ year, number of month, number of day in month ]
		 * http://en.wikipedia.org/wiki/Julian_day
		 *
		 * @param {number} JD - number of Julian Day
		 * @return {number[]}
		 * @private
		 */
		exports.JDtoYMD = JDtoYMD = function ( JD ) {
			var
				a      = JD + 32044
				, b    = Math.floor( ( 4 * a + 3 ) / 146097 )
				, c    = a - Math.floor( 146097 * b / 4 )
				, d    = Math.floor( ( 4 * c + 3 ) / 1461 )
				, e    = c - Math.floor( 1461 * d / 4 )
				, m    = Math.floor( ( 5 * e + 2 ) / 153 )
				, mnth = m + 3 - 12 * Math.floor( m / 10 )
				, day  = e - Math.floor( ( 153 * m + 2 ) / 5 ) + 1
				;

			return [ 100 * b + d - 4800 + Math.floor( m / 10 ), mnth, day ];
		};

		/**
		 * Number of Julian Day -> Number of ISO8601 week in year
		 *
		 * @param {number} JD
		 * @return {number}
		 * @constructor
		 */
		exports.JDtoWeekNumber = function ( JD ) {
			return YMDtoWeekNumber.apply( null, JDtoYMD( JD ) );
		};

		/**
		 *	Returns number of Julian Day
		 *  http://en.wikipedia.org/wiki/Julian_day
		 *
		 *	@param {number} year      - number of year (i.e. 2012)
		 *	@param {number} [month=1] - number of month (1 - january ... 12 - december)
		 *	@param {number} [day=1]   - number of day in month (1...31)
		 *	@return {number}
		 */
		exports.YMDtoJD = YMDtoJD = function ( year, month, day ) {
			var a, y, m;
			month || ( month = 1 );
			a = Math.floor( ( 14 - month ) / 12 );
			y = +year + 4800 - a;
			m = +month + 12 * a - 3;
			return ( +day || 1 ) + Math.floor( ( 153 * m + 2 ) / 5 ) + 365 * y + Math.floor( y / 4 ) - Math.floor( y / 100 ) + Math.floor( y / 400 ) - 32045;
		};

		/**
		 *	Converts year, number of ISO8601 week and number of day in week to number of Julian Day
		 *
		 *	@param {number} year    - number of year (i.e. 2012)
		 *	@param {number} week    - number of ISO8601 week
		 *	@param {number} [dow=1] - number of week day (1 - Mon, 2 - Tue, ... 7 - Sun)
		 *	@return {number}
		 */
		exports.YWDoWtoJD = YWDoWtoJD = function ( year, week, dow ) {
			var
				dowby = YMDtoDayOfWeek( year, 1, 1 ) || 7
				, jd = dowby > 1 && dowby < 5 ? YMDtoJD( year - 1, 12, 33 - dowby ) : YMDtoJD( year, 1, dowby === 1 ? 1 : 9 - dowby )
				;
			return jd + 7 * ( week - 1 ) + ( dow || 1 ) - 1;
		};

		/**
		 *	Converts date in ISO8601 format to number of Julian Day
		 *
		 *	@param {string} ISODate, supported formats: "2015-W05-2T...", "2015-W05-2", "2015-W05", "2015-01-26T...", "2015-01-26", "2015-01", "2015"
		 *	@return {number}
		 */
		exports.ISOtoJD = function ( ISODate ) {
			var ywd;
			if ( ~ISODate.indexOf( 'W' ) ) {
				// 2015-W05-2 (It's tuesday 2015-01-27)
				// 2015-W05 (It's monday 2015-01-26)
				ywd = ISODate.split( '-' );
				return YWDoWtoJD( +ywd[ 0 ], +ywd[ 1 ].substr( 1 ), +ywd[ 2 ] );
			} else {
				// 2015-01-26
				// 2015-01
				// 2015
				ISODate = ISODate.split( 'T' )[ 0 ];
				return YMDtoJD.apply( null, ISODate.split( '-' ).map( Number ) );
			}
		};

		/**
		 *	Converts Date object to number Julian Day
		 *
		 *	@param {Date} date - Date object
		 *	@return {number}
		 */
		exports.DateToJD = function ( date ) {
			return YMDtoJD( date.getFullYear(), date.getMonth() + 1, date.getDate() );
		};

		/**
		 *	Converts Date object to number of the month in AD (Anno Domini or A.D.)
		 *
		 *	@param {Date} date
		 *	@return {number}
		 */
		exports.DateToADMonth = function ( date ) {
			return date.getFullYear() * 12 + date.getMonth();
		};

		/**
		 * Extracts year, month and may from Julian Day and applies they to Data object (if date isn't provided new object Date will be created)
		 *
		 * @param {number} JD   - number of Julian Day
		 * @param {Date} [date] - Date object for mutation
		 * @return {Date}
		 */
		exports.JDtoDate = function ( JD, date ) {
			var
				ymd = JDtoYMD( JD )
				;
			if ( !date ) {
				date = new Date;
				date.setHours( 0, 0, 0, 0 );
			}
			date.setFullYear( ymd[ 0 ], ymd[ 1 ] - 1, ymd[ 2 ] );
			return date;
		};

		/**
		 * Converts Data object to ISO8601 date "YYYY-MM-DD"
		 *
		 * @param {Date} date - Date object
		 * @return {string}
		 */
		exports.DateToISO_YMD = function ( date ) {
			return date.getFullYear() + '-' + pad_( date.getMonth() + 1 ) + '-' + pad_( date.getDate() );
		};

		/**
		 * Converts Data object to ISO8601 date "HH:MM"
		 *
		 * @param {Date} date
		 * @return {string}
		 */
		exports.DateToISO_HM = function ( date ) {
			return pad_( date.getHours() ) + ':' + pad_( date.getMinutes() );
		};

		/**
		 * Converts Data object to ISO8601 date "HH:MM:SS"
		 *
		 * @param {Date} date - Date object
		 * @return {string}
		 */
		exports.DateToISO_HMS = function ( date ) {
			return pad_( date.getHours() ) + ':' + pad_( date.getMinutes() ) + ':' + pad_( date.getSeconds() );
		};

		/**
		 * Converts Julian Day to ISO8601 date "YYYY-MM-DD"
		 *
		 * @param {number} JD - number of Julian Day
		 * @return {string}
		 */
		exports.JDtoISO_YMD = function ( JD ) {
			var ymd = JDtoYMD( JD );
			return ymd[ 0 ] + '-' + pad_( ymd[ 1 ] ) + '-' + pad_( ymd[ 2 ] );
		};

		/**
		 * Converts Julian Day to ISO8601 date "YYYY-MM"
		 *
		 * @param {number} JD - number of Julian Day
		 * @return {string}
		 */
		exports.JDtoISO_YM = function ( JD ) {
			var ymd = JDtoYMD( JD );
			return ymd[ 0 ] + '-' + pad_( ymd[ 1 ] );
		};

		/**
		 * Converts Julian Day to ISO8601 date "YYYY-WWW"
		 *
		 * @param {number} JD - number of Julian Day
		 * @return {string}
		 */
		exports.JDtoISO_YW = function ( JD ) {
			return YDMtoISO_YW.apply( null, JDtoYMD( JD ) );
		};

		/**
		 * Converts number of Julian Day to number of the month in AD (Anno Domini or A.D.)
		 *
		 * @param {number} JD - number of Julian Day
		 * @return {number}
		 */
		exports.JDtoADMonth = function ( JD ) {
			var d = JDtoYMD( JD );
			return d[ 0 ] * 12 + d[ 1 ] - 1;
		};

		/**
		 * Converts year, month and day to ISO8601 string YYYY-WWW
		 *
		 * @param {number} year  - number of year (i.e. 2012)
		 * @param {number} month - number of month (1 - january ... 12 - december)
		 * @param {number} day   - number of day in month (1...31)
		 * @return {string}
		 */
		exports.YDMtoISO_YW = YDMtoISO_YW = function ( year, month, day ) {
			var d = YMDtoYWd_( year, month, day );
			return d[ 0 ] + '-W' + ( d[ 1 ] < 10 ? '0' + d[ 1 ] : d[ 1 ] );
		};

		/**
		 * Converts year, month and day to ISO8601 string YYYY-WWW-DD
		 *
		 * @param {number} year  - number of year (i.e. 2012)
		 * @param {number} month - number of month (1 - january ... 12 - december)
		 * @param {number} day   - number of day in month (1...31)
		 * @return {string}
		 */
		exports.YDMtoISO_YWD = function ( year, month, day ) {
			var d = YMDtoYWd_( year, month, day );
			return d[ 0 ] + '-W' + ( d[ 1 ] < 10 ? '0' + d[ 1 ] : d[ 1 ] ) + '-' + d[ 2 ];
		};

		/**
		 * Converts year, month and day to ISO8601 week number
		 *
		 * @param {number} year  - number of year (i.e. 2012)
		 * @param {number} month - number of month (1 - january ... 12 - december)
		 * @param {number} day   - number of day in month (1...31)
		 * @return {number}
		 */
		exports.YMDtoWeekNumber = YMDtoWeekNumber = function ( year, month, day ) {
			return YMDtoYWd_( year, month, day )[ 1 ];
		};

		/**
		 * Returns number of week day (1 - Mon, 2 - Tue, ... 7 - Sun)
		 *
		 * @param {number} year  - number of year (i.e. 2012)
		 * @param {number} month - number of month (1 - january ... 12 - december)
		 * @param {number} day   - number of day in month (1...31)
		 * @return {number}
		 */
		exports.YMDtoDayOfWeek = YMDtoDayOfWeek = function ( year, month, day ) {
			var
				m = ( 14 - month ) / 12 >> 0
				, y = year + 4800 - m
				, r = ( day + ( ( 153 * ( month + 12 * m - 3 ) + 2 ) / 5 >> 0 ) + 365 * y + ( y / 4 >> 0 ) - ( y / 100 >> 0 ) + ( y / 400 >> 0 ) - 32045 ) % 7 + 1
				;
			return r === 7 ? 0 : r;
		};

		/**
		 * Returns number of week day of  (1 - Mon, 2 - Tue, ... 7 - Sun)
		 *
		 * @param {number} JD - number of Julian Day
		 * @returns {number}
		 */
		exports.JDtoDayOfWeek = function ( JD ) {
			return YMDtoDayOfWeek.apply( null, JDtoYMD( JD ) );
		};

		/**
		 * Returns number of week day (1 - Mon, 2 - Tue, ... 7 - Sun)
		 *
		 * @param {string} YYMMDD - ISO8601 date string "YYYY-MM-DD"
		 * @return {number}
		 */
		exports.ISO_YMDtoDayOfWeek = function ( YYMMDD ) {
			return YMDtoDayOfWeek.apply( null, YYMMDD.split( '-' ).map( Number ) );
		};

		/**
		 *
		 * @param {Date} date - Date object
		 * @return {number}
		 */
		exports.DateToMinutes = function ( date ) {
			return date.getHours() * 60 + date.getMinutes();
		};

		/**
		 * Converts hours+minutes to minutes from begin of day
		 *
		 * @param {number} hours       - number of an hour (0..23)
		 * @param {number} [minutes=0]
		 * @return {number}
		 */
		exports.HMtoMinutes = HMtoMinutes = function ( hours, minutes ) {
			return hours * 60 + ( minutes || 0 );
		};

		/**
		 * Converts hours+minutes+seconds to seconds from begin of day
		 *
		 * @param {number} hours       - number of an hour (0..23)
		 * @param {number} [minutes=0]
		 * @param {number} [seconds=0]
		 * @return {number}
		 */
		exports.HMStoSeconds = HMStoSeconds = function ( hours, minutes, seconds ) {
			return hours * 3600 + ( minutes || 0 ) * 60 + ( seconds || 0 );
		};

		/**
		 * Converts ISO time "HH:MM" to minutes from begin of day
		 *
		 * @param {string} HHMM - ISO time string "HH:MM"
		 * @return {number}
		 */
		exports.ISO_HMtoMinutes = function ( HHMM ) {
			return HMtoMinutes.apply( null, HHMM.split( ':' ).map( Number ) );
		};

		/**
		 * Converts ISO time "HH:MM:SS" to seconds from begin of day
		 *
		 * @param {string} HHMMSS - ISO time string "HH:MM:SS"
		 * @return {number}
		 */
		exports.ISO_HMStoSeconds = function ( HHMMSS ) {
			return HMStoSeconds.apply( null, HHMMSS.split( ':' ).map( Number ) );
		};

		/**
		 * Converts ISO time "HH:MM:SS" to percents from begin of day
		 *
		 * @param {string} HHMMSS - ISO time string "HH:MM:SS"
		 * @return {number}
		 */
		exports.ISO_HMStoPercents = function ( HHMMSS ) {
			return HMStoSeconds.apply( null, HHMMSS.split( ':' ).map( Number ) ) * 100 / 86399;
		};

		/**
		 * Converts minutes from begin of day to ISO Time "HH:MM"
		 *
		 * @param {number} minutes - minutes from begin of day
		 * @return {string}
		 */
		exports.minutesToISO_HM = function ( minutes ) {
			return pad_( minutes / 60 >> 0 ) + ':' + pad_( minutes % 60 );
		};

		/**
		 * Calculates number of the month in AD (Anno Domini or A.D.) from ISO Date "YYYY-MM..."
		 *
		 * @param {string} YM - ISO date string "2015-01-26T...", "2015-01-26", "2015-01", "2015"
		 * @return {number}
		 */
		exports.ISOtoADMonth = ISOtoADMonth = function ( YM ) {
			var s = YM.split( '-' ).map( Number );
			return s[ 0 ] * 12 + ( s[ 1 ] || 1 ) - 1;
		};

		/**
		 * @deprecated just for back-compatibility
		 */
		exports.ISO_YMtoAbsMonth = ISOtoADMonth;

		/**
		 * Converts number of the month in AD (Anno Domini or A.D.) to ISO Date "YYYY-MM"
		 *
		 * @param {number} adMonth - number of the month in AD
		 * @return {number}
		 */
		exports.ADMonthToISO_YM = ADMonthToISO_YM = function ( adMonth ) {
			return ( adMonth / 12 >> 0 ) + '-' + pad_( adMonth % 12 + 1 );
		};

		/**
		 * @deprecated just for back-compatibility
		 */
		exports.AbsMonthToISO_YM = ADMonthToISO_YM;

		/**
		 * Converts "number of the month in AD (Anno Domini or A.D.) to number of Julian Day of first day of the month
		 *
		 * @param {number} adMonth - number of the month in AD
		 * @return {number}
		 */
		exports.ADMonthToJD = ADMonthToJD = function ( adMonth ) {
			return YMDtoJD( adMonth / 12 >> 0, adMonth % 12 + 1, 1 );
		};

		/**
		 * @deprecated just for back-compatibility
		 */
		exports.AbsMonthToJD = ADMonthToJD;

	}

	if ( 'define' in global && define.amd ) { // AMD, amdjs, RequireJS and etc
		define( name_, deps_, factory_ );
	} else if ( !global.SP && typeof require === 'function' ) { // Node (commonJS) or Browserify
		module.exports = factory_.apply( global, deps_.map( require ) ) || exports;
	} else { // Glued into bundle...
		global[ name_ ] = factory_.apply( global, deps_.map( function ( dep ) {
				if ( !this[ dep ] ) throw new TypeError( dep + ' is undefined' );
				return this[ dep ];
			}, global.SP ) ) || exports;
	}
} )( typeof self === "undefined" ? typeof global === "undefined" ? this : global : self, typeof module === 'object' && module.exports || typeof exports === 'object' && exports || {} );
