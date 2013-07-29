/*jslint white: true, undef: true, nomen: true, regexp: true, bitwise: true, strict: true, browser: true, bitwise: true */

"use strict";

var H = {};
H.type = "12c";
H.touch_display = false;
H.vertical_layout = false;

H.disp_theo_width = 700.0;
H.disp_theo_height = 438.0;
H.disp_key_offset_x = 44.0;
H.disp_key_offset_y = 151.0;
H.disp_key_width = 54;
H.disp_key_height = 50;
H.disp_key_dist_x = (606.0 - 44.0) / 9;
H.disp_key_dist_y = (364.0 - 151.0) / 3;
/* HP-12C emulator 
 * Copyright (c) 2011 EPx.com.br.
 * All rights reserved.
 */

/*jslint white: true, undef: true, nomen: true, regexp: true, strict: true, browser: true, bitwise: true */
/*global H */

"use strict";

H.badnumber = function (res)
{
	return (isNaN(res) || ! isFinite(res));
};

H.binary_sgn = function (val)
{
	return (val >= 0 ? 1 : -1);
};

H.cl5_round = function (val, decs)
{
	if (decs > 11) {
		return val;
	}
	var scale = Math.pow(10, decs);
	return Math.round(Math.abs(val) * scale) / scale * H.binary_sgn(val);
};

H.trim = function (stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g, "");
};

H.zeropad = function (s, n)
{
	s = "" + s;
	while (s.length < n) {
		s = "0" + s;
	}
	return s;
};

H.i18n = function (s, comma, dp0)
{
	// dp0 means: add decimal point after a whole number
	var dpos = s.indexOf('.');

	if (dpos == -1 && dp0) {
		s += ".";
		dpos = s.length - 1;
	}

	if (dpos != -1 && comma) {
		s = s.slice(0, dpos) + ',' + s.slice(dpos + 1);
	}

	if (dpos == -1) {
		// phantom position to satisfy loop ahead
		dpos = s.length;
	}

	var ts = comma ? "." : ",";

	for (var e = dpos - 3; e > 0 + ((s.charAt(0) == '-' || s.charAt(0) == " ") ? 1 : 0); e -= 3) {
		s = s.slice(0, e) + ts + s.slice(e);
	}

	return s;
};

H.tzoffset = function (d)
{
	// returns the time zone offset, expressed as "hours *behind* UTC".
	// that would be 180 minutes for Brazil (-0300) and -60 minutes for Germany (+0100)
	return d.getTimezoneOffset() * 60000;
};

H.date_check = function (year, month, day)
{
	var daymax = 31;
	if (month == 4 || month == 6 || month == 9 || month == 11) {
		daymax = 30;
	} else if (month == 2) {
		daymax = 28;
		if ((year % 4) === 0 && (((year % 100) !== 0) || ((year % 400) === 0))) {
			// leap: divisible by 4 and not ending with 00
			//       years ending in 00 but divisible by 400 are leap!
			daymax = 29;
		}
	}
	if (day <= 0 || day > daymax || year <= 0 || year > 9999 || month <= 0 || month > 12) {
		return 0;
	}
	return 1;
};

H.date_interpret = function (n, dmy)
{
	n = Math.round(Math.abs(n) * 1000000);
	var day = Math.round(n / 1000000) % 100;
	var month = Math.round(n / 10000) % 100;
	var year = Math.round(n % 10000);

	if (! dmy) {
		var tmp = day;
		day = month;
		month = tmp;
	}

	if (! H.date_check(year, month, day)) {
		return null;
	}

	// set date at noon, so daylight savings timezone transtion will not change the day.
	return new Date(year, month - 1, day, 12, 0, 0); 
};

H.date_diff = function (d1, d2)
{
	// Dates' timezones may be different because of daylight savings, so we
	// need to compensate for.
	//
	// Math.round could be enough to do this compensation, but we prefer to
	// be twice as safe.
	
	return Math.round(((d2.getTime() - H.tzoffset(d2)) - (d1.getTime() - H.tzoffset(d1))) / 86400000);
};

H.date_add = function (dbase, days)
{
	// daylight savings timezone not a problem as long as dbase is > 1:01am,
	// so even 1 or 2 hour changes will not change the day.
	dbase.setTime(dbase.getTime() + Math.floor(days) * 86400000);
};

H.date_diff30 = function (d1, d2)
{
	var dd1 = d1.getDate();
	var dd2 = d2.getDate();
	var z1 = dd1;
	var z2 = dd2;

	if (dd1 == 31) {
		z1 = 30;
	}

	if (dd2 == 31) {
		if (dd1 >= 30) {
			z2 = 30;
		}
	}

	var fdt1 = 360 * d1.getFullYear() + 30 * (d1.getMonth() + 1) + z1;
	var fdt2 = 360 * d2.getFullYear() + 30 * (d2.getMonth() + 1) + z2;

	return fdt2 - fdt1;
};

H.date_gen = function (dd, dmy)
{
	if (dmy) {
		return dd.getDate() + (dd.getMonth() + 1) / 100 + dd.getFullYear() / 1000000;
	} else {
		return (dd.getMonth() + 1) + dd.getDate() / 100 + dd.getFullYear() / 1000000;
	}
};

H.date_to_show = function (dd, dmy)
{
	var dow = dd.getDay();
	if (dow === 0) {
		dow = 7;
	}
	return H.date_gen(dd, dmy).toFixed(6) + "  " + dow;
};

if (! window.console) {
	window.console = {};
}
if (! window.console.log) {
	window.console.log = function (msg) {
	};
}

H.type_cookie = 'hp12c';
if (H.type == "12c-platinum") {
	H.type_cookie = 'hp12cpl';
} else if (H.type == "11c") {
	H.type_cookie = 'hp11c';
}

H.INTERACTIVE = 0;
H.PROGRAMMING = 1;
H.RUNNING = 2;
H.RUNNING_STEP = 3;

// financial constants (12c)
H.FIN_N = 0;
H.FIN_I = 1;
H.FIN_PV = 2;
H.FIN_PMT = 3;
H.FIN_FV = 4;

// Statistics (map to stomemory)
H.STAT_N  = 1;
H.STAT_X  = 2;
H.STAT_X2 = 3;
H.STAT_Y  = 4;
H.STAT_Y2 = 5;
H.STAT_XY = 6;

if (H.type == "11c") {
	H.STAT_N  = 0;
	H.STAT_X  = 1;
	H.STAT_X2 = 2;
	H.STAT_Y  = 3;
	H.STAT_Y2 = 4;
	H.STAT_XY = 5;
}

H.STAT_MIN = H.STAT_N;
H.STAT_MAX = H.STAT_XY;

// 11C
H.TRIGO_DEG = 0;
H.TRIGO_RAD = 1;
H.TRIGO_GRAD = 2;

// 11C
H.NOTATION_FIX = 0;
H.NOTATION_SCI = 1;
H.NOTATION_ENG = 2;

H.value_max = 9.999999 * Math.pow(10, 99);
H.value_min = Math.pow(10, -99);

// 12C defaults
H.ram_MAX = 100;
H.ram_ADDR_SIZE = 2;
H.STOP_INSTRUCTION = "43.33.00"; // GTO 00, stops execution
H.STOP_INSTRUCTION_IS_INVALID = false;
H.INSTRUCTION_SIZE = 2;
H.INSTRUCTION_MAX = 100;

if (H.type == "12c-platinum") {
	H.ram_MAX = 400;
	H.ram_ADDR_SIZE = 3;
	H.STOP_INSTRUCTION = "43.33.000";
} else if (H.type == "11c") {
	H.ram_MAX = 203;
	H.ram_ADDR_SIZE = 3;
	H.STOP_INSTRUCTION = "50";
	H.STOP_INSTRUCTION_IS_INVALID = true;
}

H.MEM_MAX = 20;

if (H.type == "12c-platinum") {
	H.MEM_MAX = 30;
}

H.ERROR_DIVZERO = 0;
H.ERROR_OVERFLOW = 1;
H.ERROR_STAT = 2;
H.ERROR_IP = 4;

// 11C
H.ERROR_INDEX = 3;
H.ERROR_RTN = 5;
H.ERROR_FLAG = 6;

// 12C
H.ERROR_IRR = 3;
H.ERROR_INTEREST = 5;
H.ERROR_MEMORY = 6;
H.ERROR_IRR2 = 7;
H.ERROR_DATE = 8;
/* HP-12C emulator 
 * Copyright (c) 2011 EPx.com.br.
 * All rights reserved.
 */

/*jslint white: true, undef: true, nomen: true, regexp: true, bitwise: true, strict: true, browser: true, bitwise: true */
/*global H */

"use strict";

function Hp12c_debug(format_result)
{
	this.memwin = null;
	this.format_result = format_result;
}

Hp12c_debug.prototype.show_memory2 = function ()
{
	if (! this.memwin || ! this.memwin.document) {
		// window has been closed; don't schedule updates anymore
		this.memwin = null;
		return;
	}

	var windoc = this.memwin.document;
	var now = new Date();
	var title = windoc.getElementById('tt');
	var e;

	if (title) {
		title.innerHTML = H.type + " memory at " + now;

		if (H.type != "11c") {
			for (e = 0; e < H.machine.finmemory.length; ++e) {
				windoc.getElementById("finmemory" + e).innerHTML =
					this.format_result(H.machine.finmemory[e]);
			}
		}
		for (e = 0; e < H.machine.stomemory.length; ++e) {
			windoc.getElementById("stomemory" + e).innerHTML =
				this.format_result(H.machine.stomemory[e]);
		}
		if (H.type != "11c") {
			for (e = 0; e < H.machine.njmemory.length; ++e) {
				windoc.getElementById("njmemory" + e).innerHTML =
					this.format_result(H.machine.njmemory[e]);
			}
		}
		windoc.getElementById("x").innerHTML = this.format_result(H.machine.x);
		windoc.getElementById("last_x").innerHTML = this.format_result(H.machine.last_x);
		windoc.getElementById("y").innerHTML = this.format_result(H.machine.y);
		windoc.getElementById("z").innerHTML = this.format_result(H.machine.z);
		windoc.getElementById("w").innerHTML = this.format_result(H.machine.w);

		for (e = 0; e < H.machine.ram.length; ++e) {
			windoc.getElementById("ram" + e).innerHTML = H.machine.ram[e];
		}
	}

	// closure trick, since 'this' changes meaning inside setTimeout
	var a = this;
	window.setTimeout(function () {
		a.show_memory2();
	}, 1000);
};

Hp12c_debug.prototype.show_memory = function ()
{
	this.memwin = window.open(H.type_cookie + '_memory.html');
	var a = this;
	window.setTimeout(function () {
		a.show_memory2();
	}, 1000);
};
/* HP-12C emulator 
 * Copyright (c) 2011 EPx.com.br.
 * All rights reserved.
 */

/*jslint white: true, undef: true, nomen: true, regexp: true, strict: true, browser: true, bitwise: true */
/*global H, Hp12c_machine */

"use strict";

function Hp12c_dispatcher()
{
}

// aliases to function and modifier arrays;
var K = [];
var M = [];
var I;

Hp12c_dispatcher.prototype.functions = K;
Hp12c_dispatcher.prototype.modifier_sm = M;

Hp12c_dispatcher.prototype.KEY_RS = 31;
Hp12c_dispatcher.prototype.KEY_SST = 32;
Hp12c_dispatcher.prototype.KEY_RDOWN = 33;
H.FF = Hp12c_dispatcher.prototype.KEY_FF = 42;
H.GG = Hp12c_dispatcher.prototype.KEY_GG  = 43;
H.STO = Hp12c_dispatcher.prototype.KEY_STO = 44;
H.RCL = Hp12c_dispatcher.prototype.KEY_RCL = 45;
Hp12c_dispatcher.prototype.KEY_DECIMAL = 48;
Hp12c_dispatcher.prototype.KEY_PLUS = 40;
Hp12c_dispatcher.prototype.KEY_MINUS = 30;
Hp12c_dispatcher.prototype.KEY_MULTIPLY = 20;
Hp12c_dispatcher.prototype.KEY_DIVIDE = 10;
Hp12c_dispatcher.prototype.KEY_BACKSPACE = 98;
H.STO2 = H.STO * 100 + 48;
H.RCL2 = H.RCL * 100 + 48;
H.RCL_GG = H.RCL * 100 + H.GG;
H.STO_PLUS = H.STO * 100 + 40;
H.STO_MINUS = H.STO * 100 + 30;
H.STO_TIMES = H.STO * 100 + 20;
H.STO_DIVIDE = H.STO * 100 + 10;
H.GTO = H.GG * 100 + 33;
// program typing mode only
H.GTO_MOVE = H.GTO * 100 + 48;
// does not exist in 12c
H.HYP = H.HYPINV = H.LBL = H.GSB = H.FIX = H.SCI = H.ENG = H.STO_F = 99999999;

Hp12c_dispatcher.init_vars = function () {
	var Keys = [11, 12, 13, 14, 15, 16, 7, 8, 9, 10,
	    	    21, 22, 23, 24, 25, 26, 4, 5, 6, 20,
	    	    31, 32, 33, 34, 35, 36, 1, 2,  3, 30,
	    	    41, 42, 43, 44, 45, 0, 48, 49, 40,
	    	    98];

	var Modifiers = [H.FF, H.GG, H.STO, H.RCL, 48, 10, 20, 30, 40, 33];

	var i;

	for (i = 0; i < Keys.length; i++) {
		K[Keys[i]] = [];
	}

	for (i = 0; i < Modifiers.length; i++) {
		M[Modifiers[i]] = [];
	}
};

Hp12c_dispatcher.init_vars();

H.make_closure = function (fname, args)
{
	var f = function () {
		H.machine[fname].apply(H.machine, args);
	};

	f.closure_type = "machine";
	f.closure_name = fname;

	return f;
};

H.make_pgrm_closure = function (fname, arg)
{
	var f = function () {
		H.pgrm[fname].call(H.pgrm, arg);
	};

	f.closure_type = "pgrm";
	f.closure_name = fname;

	return f;
};

I = 11;

K[I][H.FF] = H.make_closure("amortization", []);
K[I][H.GG] = H.make_closure("ston_12x", []);
K[I][H.GG].dont_rst_do_fincalc = 1;
K[I][H.RCL] = H.make_closure("rclfin", [0]);
K[I][H.STO] = H.make_closure("stofin", [0]);
K[I][H.STO].dont_rst_do_fincalc = 1;
K[I][0] = H.make_closure("sto_or_calc_fin", [0]);
K[I][0].dont_rst_do_fincalc = 1;

I = 12;

K[I][H.FF] = H.make_closure("simple_interest", []);
K[I][H.GG] = H.make_closure("stoi_12div", []);
K[I][H.GG].dont_rst_do_fincalc = 1;
K[I][H.RCL] = H.make_closure("rclfin", [1]);
K[I][H.STO] = H.make_closure("stofin", [1]);
K[I][H.STO].dont_rst_do_fincalc = 1;
K[I][0] = H.make_closure("sto_or_calc_fin", [1]);
K[I][0].dont_rst_do_fincalc = 1;

I = 13;

K[I][H.FF] = H.make_closure("npv", []);
K[I][H.GG] = H.make_closure("stoCF0", []);
K[I][H.RCL] = H.make_closure("rclfin", [2]);
K[I][H.STO] = H.make_closure("stofin", [2]);
K[I][H.STO].dont_rst_do_fincalc = 1;
K[I][0] = H.make_closure("sto_or_calc_fin", [2]);
K[I][0].dont_rst_do_fincalc = 1;

I = 14;

K[I][H.FF] = H.make_closure("rnd", []);
K[I][H.GG] = H.make_closure("stoCFj", []);
K[I][H.RCL] = H.make_closure("rclfin", [3]);
K[I][H.RCL_GG] = H.make_closure("rclCFj", []);
K[I][H.STO] = H.make_closure("stofin", [3]);
K[I][H.STO].dont_rst_do_fincalc = 1;
K[I][0] = H.make_closure("sto_or_calc_fin", [3]);
K[I][0].dont_rst_do_fincalc = 1;

I = 15;

K[I][H.FF] = H.make_closure("irr", []);
K[I][H.GG] = H.make_closure("stoNj", []);
K[I][H.RCL_GG] = H.make_closure("rclNj", []);
K[I][H.RCL] = H.make_closure("rclfin", [4]);
K[I][H.STO] = H.make_closure("stofin", [4]);
K[I][H.STO].dont_rst_do_fincalc = 1;
K[I][0] = H.make_closure("sto_or_calc_fin", [4]);
K[I][0].dont_rst_do_fincalc = 1;

I = 16;

if (H.type == "12c-platinum") {
	K[I][H.FF] = H.make_closure("rpn_mode", []);
}

K[I][H.GG] = H.make_closure("date_date", []);
K[I][0] = H.make_closure("chs", []);

for (I = 0; I <= 9; ++I) {
	// adds all functions that are commond to all digits
	K[I][H.FF] = H.make_closure("set_decimals", [I, 0]);
	K[I][H.RCL] = H.make_closure("rcl", [I]);
	K[I][H.RCL2] = H.make_closure("rcl", [I + 10]);
	K[I][H.STO] = H.make_closure("sto", [I]);
	K[I][H.STO2] = H.make_closure("sto", [I + 10]);
	K[I][H.STO_PLUS] = H.make_closure("stoinfix", [I, H.STO_PLUS]);
	K[I][H.STO_MINUS] = H.make_closure("stoinfix", [I, H.STO_MINUS]);
	K[I][H.STO_TIMES] = H.make_closure("stoinfix", [I, H.STO_TIMES]);
	K[I][H.STO_DIVIDE] = H.make_closure("stoinfix", [I, H.STO_DIVIDE]);
	K[I][H.GTO] = H.make_closure("gto_digit_add", [I]);
	K[I][H.GTO].dont_rst_modifier = 1;
	K[I][0] = H.make_closure("digit_add", [I]);
}

I = 7;

K[I][H.GG] = H.make_closure("set_begin", [1]);
K[I][H.GG].dont_rst_do_fincalc = 1;

I = 8;

K[I][H.GG] = H.make_closure("set_begin", [0]);
K[I][H.GG].dont_rst_do_fincalc = 1;

I = 9;

K[I][H.GG] = H.make_closure("mem_info", []);
K[I][H.GG].no_pgrm = 1;

I = 10;

K[I][0] = H.make_closure("divide", []);
M[I][H.STO] = H.STO_DIVIDE;

I = 21;

K[I][H.FF] = H.make_closure("bond_price", []);
K[I][H.GG] = H.make_closure("sqroot", []);
K[I][0] = H.make_closure("poweryx", []);

I = 22;

K[I][H.FF] = H.make_closure("bond_yield", []);
K[I][H.GG] = H.make_closure("exp", []);
K[I][0] = H.make_closure("reciprocal", []);

I = 23;

K[I][H.FF] = H.make_closure("depreciation_sl", []);
K[I][H.GG] = H.make_closure("ln", []);
K[I][0] = H.make_closure("percentT", []);

I = 24;

K[I][H.FF] = H.make_closure("depreciation_soyd", []);
K[I][H.GG] = H.make_closure("frac", []);
K[I][0] = H.make_closure("deltapercent", []);

I = 25;

K[I][H.FF] = H.make_closure("depreciation_db", []);
K[I][H.GG] = H.make_closure("intg", []);
K[I][0] = H.make_closure("percent", []);

I = 26;

K[I][H.GG] = H.make_closure("date_dys", []);
K[I][H.STO] = H.make_closure("toggle_compoundf", []);
K[I][0] = H.make_closure("input_exponential", []);

if (H.type == "12c-platinum") {
	K[I][H.FF] = H.make_closure("algebraic_mode", []);
}

I = 4;

K[I][H.GG] = H.make_closure("set_dmy", [1]);

I = 5;

K[I][H.GG] = H.make_closure("set_dmy", [0]);

I = 6;

K[I][H.GG] = H.make_closure("stat_avgw", []);

I = 20;

if (H.type == "12c-platinum") {
	K[I][H.GG] = H.make_closure("square", []);
}

K[I][0] = H.make_closure("multiply", []);
M[I][H.STO] = H.STO_TIMES;

I = 31;

K[I][H.GG] = H.make_closure("pse", []);
K[I][H.FF] = H.make_closure("prog_pr", []);
K[I][0] = H.make_pgrm_closure("rs", []);

I = 32;

K[I][H.FF] = H.make_closure("clear_statistics", []);
K[I][H.GG] = H.make_pgrm_closure("bst", []);
K[I][0] = H.make_pgrm_closure("sst", []);

I = 33;

K[I][H.FF] = H.make_closure("clear_prog", [0]);
K[I][0] = H.make_closure("r_down", []);
M[I][H.GG] = H.GTO;

I = 34;

K[I][H.FF] = H.make_closure("clear_fin", []);
K[I][H.GG] = H.make_closure("test_x_le_y", []);
K[I][0] = H.make_closure("x_exchange_y", []);

I = 35;

K[I][H.FF] = H.make_closure("clear_reg", []);
K[I][H.GG] = H.make_closure("test_x_eq0", []);
K[I][0] = H.make_closure("clx", []);

I = 36;

K[I][H.FF] = H.make_closure("clear_prefix", []);

if (H.type == "12c-platinum") {
	K[I][H.GG] = H.make_closure("enter", [1]);
} else {
	K[I][H.GG] = H.make_closure("lstx", []);
}

K[I][0] = H.make_closure("enter", [0]);

I = 1;

K[I][H.GG] = H.make_closure("stat_lr", [1]);

I = 2;

K[I][H.GG] = H.make_closure("stat_lr", [0]);

I = 3;

K[I][H.GG] = H.make_closure("fatorial", []);

I = 30;

K[I][0] = H.make_closure("minus", []);

M[I][H.STO] = H.STO_MINUS;

I = 41;

K[I][0] = H.make_closure("toggle_decimal_character", []);
K[I][0].no_pgrm = 1;
K[I][H.RCL] = H.make_closure("shv", []);
K[I][H.RCL].no_pgrm = 1;
K[I][H.STO] = H.make_closure("apocryphal", [1]);
K[I][H.STO].no_pgrm = 1;

I = 42;

M[I][0] = H.FF;

I = 43;

M[I][0] = H.GG;
M[I][H.RCL] = H.RCL_GG;

I = 44;

M[I][0] = H.STO;

I = 45;

M[I][0] = H.RCL;

I = 0;

K[I][H.GG] = H.make_closure("stat_avg", []);

I = 48;

K[I][H.FF] = H.make_closure("set_decimals_exponential", []);
K[I][H.GG] = H.make_closure("stat_stddev", []);
K[I][H.GTO] = H.make_closure("gto_buf_clear", []);
K[I][0] = H.make_closure("decimal_point_mode", []);
M[I][H.STO] = H.STO2;
M[I][H.RCL] = H.RCL2;

I = 49;

K[I][H.GG] = H.make_closure("stat_sigma_minus", []);
K[I][0] = H.make_closure("stat_sigma_plus", []);

I = 40;

if (H.type == "12c-platinum") {
	K[I][H.GG] = H.make_closure("lstx", []);
}

K[I][0] = H.make_closure("plus", []);
M[I][H.STO] = H.STO_PLUS;

I = 98;

K[I][0] = H.make_closure("digit_delete", []);
K[I][0].no_pgrm = 1;


Hp12c_dispatcher.prototype.handle_modifier = function (key, pgrm_mode)
{
	var modifier_table = this.modifier_sm[key];

	if (modifier_table) {
		var next_modifier = modifier_table[H.machine.modifier];
		if (next_modifier) {
			// a modifier potentialized by a previous one
			H.machine.set_modifier(next_modifier);
			return true;
		} else if (modifier_table[0]) {
			// a modifier of its own right, like f, g
			H.machine.set_modifier(modifier_table[0]);
			return true;
		}
	}

	return false;
};

Hp12c_dispatcher.prototype.find_function = function (key, pgrm_mode)
{
	var function_table = this.functions[key];
	var f = null;

	if (function_table) {
		f = function_table[H.machine.modifier];
		if (!f) {
			// no function given current modifier
			f = function_table[0];
			if (f) {
				// function without modifier
				H.machine.rst_modifier(1);
			}
		}
	}

	if (pgrm_mode && f && f.no_pgrm) {
		// this function can not be programmed; revoked
		f = null;
	}

	return f;
};

Hp12c_dispatcher.prototype.dispatch = function (key)
{
	// this is used when a real key is pressed

	if (key == 99) {
		H.debug.show_memory();
		return;
	}

	if (H.keyboard.enabled() && H.machine.error_in_display) {
		H.machine.reset_error();
		return;
	} else if (H.machine.program_mode == H.PROGRAMMING) {
		H.pgrm.type(key);
		return;
	} else if (H.machine.program_mode >= H.RUNNING) {
		H.pgrm.stop();
		return;
	}

	this.dispatch_common(key);
};

Hp12c_dispatcher.prototype.dispatch_common = function (key)
{
	// this is used bAoth by real keys and program scheduler

	var ok = 1;

	if (this.handle_modifier(key, 0)) {
		return ok;
	}

	// key is not modifier in this context, try a function

	var f = this.find_function(key, 0);

	if (!f) {
		f = function () {
			// no-op
		};
		ok = false;
	}

	var rst_modifier = 1;
	var rst_do_fincalc = 1;

	if (f.dont_rst_do_fincalc) {
		rst_do_fincalc = 0;
	}
	if (f.dont_rst_modifier) {
		rst_modifier = 0;
	}

	f();

	if (rst_modifier) {
		H.machine.rst_modifier(rst_do_fincalc);
	}

	return ok;
};

Hp12c_dispatcher.prototype.KEY_ISDIGIT = function (k) 
{
	return k >= 0 && k <= 9;
};

// remove from scope
M = undefined;
K = undefined;
I = undefined;
/* HP-12C emulator 
 * Copyright (c) 2011 EPx.com.br.
 * All rights reserved.
 */

/*jslint white: true, undef: true, nomen: true, regexp: true, strict: true, browser: true, sub: true */
/*global H */

"use strict";

function Hp12c_display()
{
	this.display_max = 9999999999;
	this.display_len = 10; // without extra -
	this.display_min = 0.0000000001;
	this.lcd = [];

	var LCD_A = 1;
	var LCD_B = 2;
	var LCD_C = 4;
	var LCD_D = 8;
	var LCD_E = 16;
	var LCD_F = 32;
	var LCD_G = 64;
	var LCD_P = 128;
	var LCD_T = 256;

	this.lcdmap = [];

	this.lcdmap['0'] = LCD_A | LCD_B | LCD_C | LCD_E | LCD_F | LCD_G;
	this.lcdmap['1'] = LCD_C | LCD_F;
	this.lcdmap['2'] = LCD_A | LCD_C | LCD_D | LCD_E | LCD_G;
	this.lcdmap['3'] = LCD_A | LCD_C | LCD_D | LCD_F | LCD_G;
	this.lcdmap['4'] = LCD_B | LCD_C | LCD_D | LCD_F;
	this.lcdmap['5'] = LCD_A | LCD_B | LCD_D | LCD_F | LCD_G;
	this.lcdmap['6'] = LCD_A | LCD_B | LCD_D | LCD_E | LCD_F | LCD_G;
	this.lcdmap['7'] = LCD_A | LCD_C | LCD_F;
	this.lcdmap['8'] = LCD_A | LCD_B | LCD_C | LCD_D | LCD_E | LCD_F | LCD_G;
	this.lcdmap['9'] = LCD_A | LCD_B | LCD_C | LCD_D | LCD_F | LCD_G;
	this.lcdmap[' '] = 0;
	this.lcdmap['.'] = LCD_P;
	this.lcdmap[','] = LCD_P | LCD_T;
	this.lcdmap['r'] = LCD_A | LCD_B;
	this.lcdmap['u'] = LCD_B | LCD_C | LCD_D;
	this.lcdmap['n'] = LCD_B | LCD_C | LCD_A;
	this.lcdmap['i'] = LCD_B;
	this.lcdmap['g'] = LCD_A | LCD_B | LCD_C | LCD_D | LCD_F | LCD_G;
	this.lcdmap['-'] = LCD_D;
	this.lcdmap['E'] = LCD_A | LCD_B | LCD_D | LCD_E | LCD_G;
	this.lcdmap['e'] = LCD_A | LCD_B | LCD_D | LCD_E | LCD_G;
	this.lcdmap['O'] = LCD_D | LCD_E | LCD_F | LCD_G;
	this.lcdmap['R'] = LCD_D | LCD_E;
	this.lcdmap['P'] = LCD_A | LCD_B | LCD_C | LCD_D | LCD_E;
	this.lcdmap[':'] = LCD_P;
	this.functionality_level = 0;

	if (! document) {
		// not running on a browser
		return;
	}

	if (! document.getElementById) {
		// not running on a browser
		return;
	}

	if (! document.getElementById("display")) {
		// not running on a browser
		return;
	}

	if (window.lcd_broken) {
		// broken (IE6) but operational otherwise
		this.functionality_level = 1;
	} else {
		// fully operational
		this.functionality_level = 2;
	}

	for (var e = 0; e <= 10; ++e) {
		this.lcd[e] = [];
		this.lcd[e][0] = 0;
		this.lcd[e][this.lcd[e].length] = document.getElementById("lcd" + e + "a");
		this.lcd[e][this.lcd[e].length] = document.getElementById("lcd" + e + "b");
		this.lcd[e][this.lcd[e].length] = document.getElementById("lcd" + e + "c");
		this.lcd[e][this.lcd[e].length] = document.getElementById("lcd" + e + "d");
		this.lcd[e][this.lcd[e].length] = document.getElementById("lcd" + e + "e");
		this.lcd[e][this.lcd[e].length] = document.getElementById("lcd" + e + "f");
		this.lcd[e][this.lcd[e].length] = document.getElementById("lcd" + e + "g");
		this.lcd[e][this.lcd[e].length] = document.getElementById("lcd" + e + "p");
		this.lcd[e][this.lcd[e].length] = document.getElementById("lcd" + e + "t");
	}
	
	this.display = document.getElementById("display");
	this.dbegin = document.getElementById("begin");
	this.ddmyc = document.getElementById("dmyc");
	this.dmodifier = document.getElementById("modifier");
	this.pgrm = document.getElementById("pgrm");
	this.rpnalg = document.getElementById("rpnalg");
	this.trigo = document.getElementById("trigo");
	this.user = document.getElementById("user");

	this.clear();
}

Hp12c_display.prototype.private_show_digit = function (dgt, pos, merge)
{
	if (pos >= this.lcd.length) {
		window.console.log("Too many characters for display");
		return;
	}
	if (! this.lcdmap[dgt]) {
		dgt = ' ';
	}
	var map = this.lcdmap[dgt];
	var element = this.lcd[pos];
	var e; 
	var f = 1;
	for (e = 1; e < element.length; ++e) {
		element[e].style.visibility = (map & f) ? "visible" : 
			((merge && element[e].style.visibility == "visible") ? "visible" :"hidden");
		f <<= 1;
	}
};

Hp12c_display.prototype.private_lcd_display = function (txt) 
{
	var f = -1;
	for (var e = 0; e < txt.length && f < this.lcd.length; ++e) {
		var dgt = txt.charAt(e);
		++f;
		if (dgt == '.' || dgt == ',') {
			// merge decimal point/thousand separator
			--f;
			this.private_show_digit(dgt, f, 1);
		} else {
			this.private_show_digit(dgt, f, 0);
		}
	}
	for (++f; f < this.lcd.length; ++f) {
		this.private_show_digit(' ', f, 0);
	}
};

Hp12c_display.prototype.show = function (txt)
{
	if (this.functionality_level >= 2) {
		this.private_lcd_display(txt);
	} else if (this.functionality_level >= 1) {
		this.display.innerHTML = txt;
	}
};

Hp12c_display.prototype.clear = function ()
{
	if (this.functionality_level >= 2) {
		for (var e = 0; e < this.lcd.length; ++e) {
			for (var f = 1; f < this.lcd[e].length; ++f) {
				this.lcd[e][f].style.visibility = "hidden";
			}
		}
	} else if (this.functionality_level >= 1) {
		this.display.innerHTML = "";
	}
};

Hp12c_display.prototype.format_result = function (n)
{
	var res = "";
	var absn = Math.abs(n);
	var fix_dec = H.machine.decimals;
	var mantissa_dec = H.machine.decimals;
	var notation = H.machine.notation;
	var degenerate = 0;
	var scale;
	var mantissa;

	if (n >= H.value_max) {
		degenerate = 1;
		scale = 99;
		n = H.value_max;
		absn = Math.abs(n);
	} else if (n <= -H.value_max) {
		degenerate = 2;
		scale = 99;
		n = -H.value_max;
		absn = Math.abs(n);
	} else if (absn >= H.value_min) {
		scale = Math.log(absn) / Math.log(10);
		// added a tad to guarantee that log(10) === 1
		scale = Math.floor(scale + 0.00000000001);
	} else {
		degenerate = 3;
		scale = -100;
		absn = n = 0;
	}

	var co = H.machine.comma;

	if (notation == H.NOTATION_FIX) {
		mantissa_dec = 6;
		if (absn > this.display_max) {
			// too big to be shown normally
			notation = H.NOTATION_SCI;
		} else if (absn !== 0 && scale < -9) {
			// too small to be shown normally
			notation = H.NOTATION_SCI;
		} else if (absn !== 0 && fix_dec < (-scale)) {
			// we need more decimals to show this number
			fix_dec = -scale;
		}
	}

	mantissa_dec = Math.min(mantissa_dec, 6);

	if (degenerate != 3) {
		mantissa = n / Math.pow(10, scale);
	} else {
		mantissa = 0;
	}

	// handle rounding up
	var mantissa_signal = mantissa >= 0 ? 1 : -1;
	mantissa = parseFloat(Math.abs(mantissa).toFixed(mantissa_dec));
	if (notation != H.NOTATION_FIX && mantissa >= 10) {
		mantissa /= 10;
		scale += 1;
	}
	// give signal back
	mantissa *= mantissa_signal;

	// until now, ENG handling == SCI
	// now, compensate for ENG
	if (notation == H.NOTATION_ENG && (! degenerate)) {
		var new_scale = 3 * Math.floor(scale / 3);
		while (scale > new_scale) {
			mantissa *= 10;
			scale -= 1;
			if (mantissa_dec > 0) {
				mantissa_dec -= 1;
			}
		}
	}

	if (notation != H.NOTATION_FIX) {
		// show as exponential
		if (mantissa === 0 && H.type != "11c" && false) {
			// in SCI mode, 12C shows 0.0000000 00 too...
			return H.i18n(' 0', co, 1);
		} else if (degenerate == 1) {
			return H.i18n(' 9.999999 99', co, 1);
		} else if (degenerate == 2) {
			return H.i18n('-9.999999 99', co, 1);
		}

		res = H.i18n(mantissa.toFixed(mantissa_dec), co, 1);
		if (mantissa >= 0) {
			res = " " + res;
		}

		// no need to compensate for thousand separators because even
		// in ENG mode mantissa is < 1000.

		// display_len does NOT count the negative sign
		// -3: exponential plus space/expo signal
		// +1: compressed decimal point (always present, even if mantissa_dec == 0)
		// +1: negative sign
		var max_m_len = this.display_len - 3 + 1 + 1;

		res = res.substr(0, max_m_len);
		while (res.length < max_m_len) {
			res = res + " ";
		}

		if (mantissa === 0) {
			scale = 0;
		}

		if (scale < 0) {
			res = res + "-" + H.zeropad((-scale).toFixed(0), 2);
		} else {
			res = res + " " + H.zeropad(scale.toFixed(0), 2);
		}
		// window.console.log(" " + n + " " + mantissa + " " + scale + " d " + degenerate + " " + res);

		return res;
	}

	// show as fixed, w/o exp
	var dec = Math.max(0, fix_dec);
	var sgn = n < 0 ? "-" : " ";
	n = Math.abs(n);
	var ll = n.toFixed(dec).length - (dec > 0 ? 1 : 0);
	if (ll > this.display_len) {
		// reduce decimals if too big for display
		dec -= (ll - this.display_len);
		dec = Math.max(0, dec);
	}
	res = H.i18n(sgn + n.toFixed(dec), co, 1);

	return res;
};

Hp12c_display.prototype.displayNumber_now = function (x)
{
	var co = H.machine.comma;

	if (isNaN(x)) {
		x = 0;
	} else if (x > H.value_max) {
		x = H.value_max;
	} else if (x < -H.value_max) {
		x = -H.value_max;
	} else if (Math.abs(x) < H.value_min) {
		x = 0;
	}

	// display result
	var sres = this.format_result(x);
	this.show(sres);
};

Hp12c_display.prototype.displayNumber_endBlink = function (x)
{
	H.machine.sti();
	this.displayNumber_now(x);
};

Hp12c_display.prototype.displayNumber = function (x)
{
	H.machine.cli();
	this.show("");
	var a = this;
	window.setTimeout(function () {
		a.displayNumber_endBlink(x);
	}, 25);
};

Hp12c_display.prototype.displayTypedNumber = function (ms, m, dec, exp, exps, xmode)
{
	var s = "";
	var co = H.machine.comma;

	if (xmode === 0) {
		if (m.length <= 0) {
			s = " 0";
		} else {
			s = (ms < 0 ? "-" : " ") + m;
		}
		if (H.type != "11c") {
			s += ".";
		}
		s = H.i18n(s, co, 0);
	} else if (xmode === 1) {
		s = H.i18n((ms < 0 ? "-" : " ") + m + "." + dec, co, 1);
	} else if (xmode === 100) {
		var rdec = dec.substr(0, 7 - m.length);
		s = H.i18n((ms < 0 ? "-" : " ") + m + "." + rdec, co, 1);
		for (var i = 0; i < (7 - rdec.length - m.length); ++i) {
			s += " ";
		}
		s += exps < 0 ? "-" : " ";
		s += H.zeropad(parseInt("0" + exp, 10).toFixed(0), 2);
	}
	this.show(s);
};

Hp12c_display.prototype.show_modifier = function (m)
{
	var txt = "";
	var txtuser = "";
	if (m == H.FF) {
		txt = "f";
	} else if (m == H.GG) {
		txt = "g";
	} else if (m == H.STO) {
		txt = "STO";
	} else if (m == H.STO2) {
		txt = "STO★";
	} else if (m == H.RCL) {
		txt = "RCL";
	} else if (m == H.RCL2) {
		txt = "RCL★";
	} else if (m == H.RCL_GG) {
		txt = "RCL g";
	} else if (m == H.STO_PLUS) {
		txt = "STO+";
	} else if (m == H.STO_PLUS_FF) {
		txt = "STO+,f";
	} else if (m == H.STO_MINUS) {
		txt = "STO-";
	} else if (m == H.STO_MINUS_FF) {
		txt = "STO-,f";
	} else if (m == H.STO_TIMES) {
		txt = "STO×";
	} else if (m == H.STO_TIMES_FF) {
		txt = "STO×,f";
	} else if (m == H.STO_DIVIDE) {
		txt = "STO÷";
	} else if (m == H.STO_DIVIDE_FF) {
		txt = "STO÷,f";
	} else if (m == H.GTO) {
		txt = "GTO";
	} else if (m == H.GTO_MOVE) {
		txt = "GTO★";
	} else if (H.type != "11c") {
		txt = "";
	} else if (m == H.HYP) {
		txt = "HYP";
	} else if (m == H.HYPINV) {
		txt = "HYPINV";
	} else if (m == H.LBL) {
		txt = "f LBL";
	} else if (m == H.GSB) {
		txt = "GSB";
	} else if (m == H.FIX) {
		txt = "f FIX";
	} else if (m == H.SCI) {
		txt = "f SCI";
	} else if (m == H.ENG) {
		txt = "f ENG";
	} else if (m == H.STO_FF) {
		txt = "STO f";
	} else if (m == H.RCL_FF) {
		txt = "RCL f";
	} else if (m == H.GG_SF) {
		txt = "g SF";
	} else if (m == H.GG_CF) {
		txt = "g CF";
	} else if (m == H.GG_FQUESTION) {
		txt = "g F?";
	}

	if (this.functionality_level >= 1) {
		this.dmodifier.innerHTML = txt;
	}
};

Hp12c_display.prototype.show_begin = function (is_begin)
{
	var txt = "";
	if (is_begin) {
		txt = "BEGIN";
	}

	if (this.dbegin && this.functionality_level >= 1) {
		this.dbegin.innerHTML = txt;
	}
};

Hp12c_display.prototype.show_error = function (err)
{
	this.show("ERROR " + err);
};

Hp12c_display.prototype.display_meminfo = function (mem, stolen)
{
	--stolen;
	var stolen_txt = (stolen % 10).toFixed(0);
	if (stolen >= 10) {
		stolen_txt = ":" + stolen_txt;
	}
	this.show("P-" + H.zeropad(mem, H.ram_ADDR_SIZE) + " R-" + stolen_txt);
};

Hp12c_display.prototype.show_dmyc = function (dmy, compoundf)
{
	var txt = "";
	if (dmy) {
		txt += "D.MY";
	}
	if (compoundf) {
		txt += "&nbsp;&nbsp;C";
	}
	if (this.ddmyc && this.functionality_level >= 1) {
		this.ddmyc.innerHTML = txt;
	}
};

Hp12c_display.prototype.show_pgrm = function (pgrm, run, pc)
{
	var txt = "";
	if (pgrm) {
		txt = "PRGM";
	} else if (run) {
		txt = "RUN " + H.zeropad(pc.toFixed(0), 2);
	}
	if (this.functionality_level >= 1) {
		this.pgrm.innerHTML = txt;
	}
};

Hp12c_display.prototype.show_algmode = function (algmode)
{
	if (this.rpnalg && H.type == "12c-platinum") {
		var txt = ["RPN", "ALG"][algmode];
		if (this.functionality_level >= 1) {
			this.rpnalg.innerHTML = txt;
		}
	}
};

Hp12c_display.prototype.show_trigo = function (trigo)
{
	if (H.type == "11c") {
		var txt = ["", "RAD", "GRAD"][trigo];
		if (this.trigo && this.functionality_level >= 1) {
			this.trigo.innerHTML = txt;
		}
	}
};

Hp12c_display.prototype.show_user = function (user)
{
	if (H.type == "11c") {
		var txt = ["", "USER"][user];
		if (this.user && this.functionality_level >= 1) {
			this.user.innerHTML = txt;
		}
	}
};
/* HP-12C emulator 
 * Copyright (c) 2011 EPx.com.br.
 * All rights reserved.
 */

/*jslint white: true, undef: true, nomen: true, regexp: true, strict: true, browser: true, sub: true, bitwise: true */
/*global H */

"use strict";

function Hp12c_keyboard()
{
	this.is_enabled = 0;
	this.kbdtable = {};
	this.kbdtable['0'] = 0;
	this.kbdtable['.'] = 48;
	this.kbdtable[','] = 48;
	this.kbdtable['1'] = 1;
	this.kbdtable['2'] = 2;
	this.kbdtable['3'] = 3;
	this.kbdtable['4'] = 4;
	this.kbdtable['5'] = 5;
	this.kbdtable['6'] = 6;
	this.kbdtable['7'] = 7;
	this.kbdtable['8'] = 8;
	this.kbdtable['9'] = 9;
	this.kbdtable['+'] = 40;
	this.kbdtable['='] = 40;
	this.kbdtable['-'] = 30;
	this.kbdtable['*'] = 20;
	this.kbdtable['x'] = 20;
	this.kbdtable['X'] = 20;
	this.kbdtable['/'] = 10;
	this.kbdtable[':'] = 10;
	this.kbdtable['\r'] = 36;
	this.kbdtable['\n'] = 36;
	this.kbdtable[' '] = 36;
	this.kbdtable['f'] = 42;
	this.kbdtable['F'] = 42;
	this.kbdtable['g'] = 43;
	this.kbdtable['G'] = 43;
	this.kbdtable['s'] = 44;
	this.kbdtable['S'] = 44;
	this.kbdtable['r'] = 45;
	this.kbdtable['R'] = 45;
	this.kbdtable['o'] = 41;
	this.kbdtable['O'] = 41;

	H.hp1xc_keyboard_flavor(this.kbdtable);

	// stay here while vertical map translation is uniform across models
	this.vertical_map = {};
	this.vertical_map[0] = -1;
	this.vertical_map[1] = 11;
	this.vertical_map[2] = 12;
	this.vertical_map[3] = 13;
	this.vertical_map[4] = 14;
	this.vertical_map[5] = 15;
	this.vertical_map[10] = -1;
	this.vertical_map[11] = 21;
	this.vertical_map[12] = 22;
	this.vertical_map[13] = 23;
	this.vertical_map[14] = 24;
	this.vertical_map[15] = 25;
	this.vertical_map[20] = 41;
	this.vertical_map[21] = 31;
	this.vertical_map[22] = 32;
	this.vertical_map[23] = 33;
	this.vertical_map[24] = 34;
	this.vertical_map[25] = 35;
	this.vertical_map[30] = 45;
	this.vertical_map[31] = 16;
	this.vertical_map[32] = 7;
	this.vertical_map[33] = 8;
	this.vertical_map[34] = 9;
	this.vertical_map[35] = 10;
	this.vertical_map[40] = 44;
	this.vertical_map[41] = 26;
	this.vertical_map[42] = 4;
	this.vertical_map[43] = 5;
	this.vertical_map[44] = 6;
	this.vertical_map[45] = 20;
	this.vertical_map[50] = 43;
	this.vertical_map[51] = 36;
	this.vertical_map[52] = 1;
	this.vertical_map[53] = 2;
	this.vertical_map[54] = 3;
	this.vertical_map[55] = 30;
	this.vertical_map[60] = 42;
	this.vertical_map[61] = 36;
	this.vertical_map[62] = 0;
	this.vertical_map[63] = 48;
	this.vertical_map[64] = 49;
	this.vertical_map[65] = 40;

	this.browser = 1;

	if (document && document.getElementById) {
		this.pointer_div = document.getElementById("pointer_div");
	} else {
		// not in a browser; surrogate to satisfy unit tests
		var s = {};
		var t = {};
		t.width = 700;
		t.height = 438;
		s.offsetLeft = 0;
		s.offsetTop = 0;
		s.style = t;
		this.pointer_div = s;
		this.browser = 0;
	}

	// recalculate keyboard coordinates
	// based on original ones for 700x438 image
	this.kx = parseInt(this.pointer_div.style.width, 10) / H.disp_theo_width;
	this.ky = parseInt(this.pointer_div.style.height, 10) / H.disp_theo_height;

	this.xoff = H.disp_key_offset_x * this.kx;
	this.yoff = H.disp_key_offset_y * this.ky;

	this.xl = H.disp_key_width * this.kx;
	this.yl = H.disp_key_height * this.ky;

	this.xd = H.disp_key_dist_x * this.kx;
	this.yd = H.disp_key_dist_y * this.ky;

	this.microsoft = (window.navigator && window.navigator.msPointerEnabled && true);
	
	this.enable();

	var o = this;

	if (this.browser) {
		if (H.touch_display) {
			if (this.microsoft) {
				var handler = function (x) {
					o.mouse_click(x);
				};
				window.cross.addEventListener("MSPointerDown", handler, true);
			} else {
				document.getElementById("cross").ontouchstart = function (x) {
					o.mouse_click(x);
				};
			}
		} else {	
			document.getElementById("cross").onclick = function (x) {
				o.mouse_click(x);
			};
		}
		document.onkeypress = function (x) {
			o.hard_keyboard(x);
		};
	}
}

Hp12c_keyboard.prototype.enable = function ()
{
	this.is_enabled = 1;
};

Hp12c_keyboard.prototype.disable = function ()
{
	this.is_enabled = 0;
};

Hp12c_keyboard.prototype.enabled = function ()
{
	return this.is_enabled;
};

Hp12c_keyboard.prototype.remap_key_vertical = function (raw)
{
	var key = this.vertical_map[raw];
	if (key === undefined || key === null) {
		key = -1;
	}
	return key;
};

Hp12c_keyboard.prototype.remap_key = function (raw)
{
	// map 'raw' keys to HP12-compatible key codes

	var hpkey = raw + 11;  // key 0 ("n") becomes key 11
	var col = (hpkey % 10); // "n" is at column 1; Divide is at column 0
	if (col === 0) {
		// "Divide" is not the key 20; it is the key 10
		// this operation does NOT change column value
		hpkey -= 10;
	}
	var row = Math.floor(hpkey / 10); // "n" and Device are at line 1

	if (hpkey == 47 /* zero */ ) {
		hpkey = 0;
	} else if (col >= 7 && col <= 9 && hpkey != 48 /* point */ && hpkey != 49 /*sigma+*/) {
		// numeric keys: key code is equal to the number it represents
		hpkey = col - 3 * (row - 1);
	}

	if (hpkey == 46) {
		// ENTER exception
		hpkey = 36;
	}
	
	return hpkey;
};

Hp12c_keyboard.prototype.hard_keyboard = function (e)
{
	var keynum;
	var keychar;
	var numcheck;

	if (window.event) {
		e = window.event;
		keynum = window.event.keyCode;
	} else if (e.which) {
		keynum = e.which;
	} else {
		return true;
	}

	keychar = String.fromCharCode(keynum);

	var kk = this.kbdtable[keychar];
	if (kk !== undefined && kk !== null) {
		H.dispatcher.dispatch(this.kbdtable[keychar]);
		e.returnValue = false;
		if (e.preventDefault) {
			e.preventDefault();
		}
		return false;
	}
	return true;
};

Hp12c_keyboard.prototype.mouse_click = function (evt)
{
	if (! evt) {
		evt = window.event;
	}

	var pos_x, pos_y;

	if (H.touch_display) {
		evt.preventDefault();
		if (this.microsoft) {
			pos_x =	(evt.pageX - this.pointer_div.offsetLeft) - this.xoff;
			pos_y = (evt.pageY - this.pointer_div.offsetTop) - this.yoff;
		} else {
			pos_x =	(evt.targetTouches[0].pageX - this.pointer_div.offsetLeft) - this.xoff;
			pos_y = (evt.targetTouches[0].pageY - this.pointer_div.offsetTop) - this.yoff;
		}
	} else {
		pos_x = (evt.offsetX ? evt.offsetX : 
			(evt.pageX - this.pointer_div.offsetLeft)) - this.xoff;
		pos_y = (evt.offsetY ? evt.offsetY :
			(evt.pageY - this.pointer_div.offsetTop)) - this.yoff;
	}

	var key;
	var in_key;

	if (H.vertical_layout) {
		if (pos_x < 0 || pos_y < 0 || pos_x >= this.xd * 6 || pos_y >= this.yd * 7) {
			return;
		}

		key = Math.floor(pos_x / this.xd) + 10 * Math.floor(pos_y / this.yd);

		while (pos_x > this.xd) {
			pos_x -= this.xd;
		}

		while (pos_y > this.yd) {
			pos_y -= this.yd;
		}

		in_key = (pos_x < this.xl) && ((pos_y < this.yl) || key == 51);
		if (in_key) {
			key = this.remap_key_vertical(key);
			if (key >= 0) {
				H.dispatcher.dispatch(key);
			}
		}
	} else {
		if (pos_x < 0 || pos_y < 0 || pos_x >= this.xd * 10 || pos_y >= this.yd * 4) {
			return;
		}

		key = Math.floor(pos_x / this.xd) + 10 * Math.floor(pos_y / this.yd);

		while (pos_x > this.xd) {
			pos_x -= this.xd;
		}

		while (pos_y > this.yd) {
			pos_y -= this.yd;
		}

		in_key = (pos_x < this.xl) && ((pos_y < this.yl) || key == 25);
		if (in_key) {
			H.dispatcher.dispatch(this.remap_key(key));
		}
	}
};
/* HP-12C emulator 
 * Copyright (c) 2011 EPx.com.br.
 * All rights reserved.
 */

/*jslint white: true, undef: true, nomen: true, regexp: true, strict: true, browser: true, sub: true, bitwise: true */
/*global H */

"use strict";

H.hp1xc_keyboard_flavor = function (kbdtable)
{
	kbdtable['w'] = 49;
	kbdtable['W'] = 49;
	kbdtable['y'] = 34;
	kbdtable['Y'] = 34;
	kbdtable['h'] = 16;
	kbdtable['H'] = 16;
	kbdtable['c'] = 35;
	kbdtable['C'] = 35;
	kbdtable['n'] = 11;
	kbdtable['N'] = 11;
	kbdtable['i'] = 12;
	kbdtable['I'] = 12;
	kbdtable['p'] = 13;
	kbdtable['P'] = 13;
	kbdtable['m'] = 14;
	kbdtable['M'] = 14;
	kbdtable['v'] = 15;
	kbdtable['V'] = 15;
	kbdtable['#'] = 23;
	kbdtable['$'] = 24;
	kbdtable['%'] = 25;
	kbdtable['!'] = 21;
	kbdtable['\\'] = 22;
	kbdtable['d'] = 33;
	kbdtable['D'] = 33;
	kbdtable[String.fromCharCode(40)] = 33;
	kbdtable['['] = 31;
	kbdtable[']'] = 32;
	kbdtable['?'] = 99;
	kbdtable[String.fromCharCode(8)] = 98;
	kbdtable['Z'] = 98;
	kbdtable['z'] = 98;
	kbdtable['e'] = 26;
	kbdtable['E'] = 26;
};

/* HP-12C emulator 
 * Copyright (c) 2011 EPx.com.br.
 * All rights reserved.
 */

/*jslint white: true, undef: true, nomen: true, regexp: true, bitwise: true, strict: true, browser: true */
/*global H */

// TODO unit tests

"use strict";

function Hp12c_machine()
{
	// calculator non-volatile memory -----------------------------------------------------------

	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.w = 0;
	this.last_x = 0;
	this.alg_op = 0;

	this.stomemory = [];
	this.finmemory = [];
	this.njmemory = [];
	this.index = 0; // 11C only

	this.ram = [];
	this.program_size = 1; // for STOP in [0]
	this.flags = [0, 0];

	this.decimals = 2;
	this.comma = 0; 

	this.begin = 0;
	this.dmy = 0;
	this.compoundf = 0;

	this.notation = H.NOTATION_FIX;
	this.trigo = H.TRIGO_DEG;
	this.user = 0;

	// volatile memory ---------------------------------------------------------------------

	this.algmode = 0;
	this.program_mode = 0;
	this.ip = 0;
	this.pushed = 0;
	this.gtoxx = "";
	this.modifier = 0;
	this.do_fincalc = 0;
	this.xmode = -1;
	this.typed_mantissa = "";
	this.typed_decimals = "";
	this.typed_mantissa_signal = 1;
	this.typed_exponent = "00";
	this.typed_exponent_signal = 1;
	this.error_in_display = 0;

	this.call_stack = []; // 11C-only

	// algebraic operations

	this.ALG_PLUS = 1;
	this.ALG_MINUS = 2;
	this.ALG_MULTIPLY = 3;
	this.ALG_DIVIDE = 4;
	this.ALG_POWER = 5;

	this.nvname = H.type_cookie;

	if (H.type == '11c') {
		this.nvN = ['x', 'y', 'z', 'w', 'last_x', 
			  'decimals', 'comma', 'index',
			  'trigo', 'user', 'notation'];
		this.nvAN = ['stomemory', 'flags'];
	} else {
		this.nvN = ['x', 'y', 'z', 'w', 'last_x', 'alg_op', 'algmode',
				'decimals', 'comma', 'begin',
				'dmy', 'compoundf', 'notation'];
		this.nvAN = ['stomemory', 'finmemory', 'njmemory'];
	}
	this.nvAX = ['ram'];
}

Hp12c_machine.prototype.program_limit = function ()
{
	if (H.type == "11c") {
		return Math.min(H.ram_MAX - 1, this.program_size - 1);
	}
	return H.ram_MAX - 1;
};

Hp12c_machine.prototype.ram_available = function ()
{
	if (H.type == "11c") {
		return Math.min(H.ram_MAX - this.program_size);
	}
	return H.ram_MAX - 1;
};

Hp12c_machine.prototype.incr_ip = function (delta)
{
	this.ip += delta;

	if (this.ip < 0 ||
	    this.ip > this.program_limit()) {
		this.ip = 0;
	}
};

Hp12c_machine.prototype.init = function ()
{
	this.clear_prog(1);
	this.clear_reg(); // implies reg, sto, fin
	this.clear_stack();
	this.error_in_display = 0;
};

Hp12c_machine.prototype.clear_fin = function ()
{
	for (var e = 0; e < 5; ++e) {
		this.finmemory[e] = 0;
	}
	this.display_result();
};

Hp12c_machine.prototype.clear_statistics = function ()
{
	// statistics share memory with STO memory
	for (var e = H.STAT_MIN; e <= H.STAT_MAX; ++e) {
		this.stomemory[e] = 0;
	}
	this.x = this.y = this.z = this.w = 0;
	this.display_result();
};

Hp12c_machine.prototype.clear_prog = function (in_pgrm)
{
	if (in_pgrm) {
		this.ram[0] = "";
		for (var e = 1; e < H.ram_MAX; ++e) {
			this.ram[e] = H.STOP_INSTRUCTION;
		}
		this.program_size = 1; // for STOP in [0]
	} else {
		this.display_result();
	}
	this.ip = 0;
};

Hp12c_machine.prototype.clear_sto = function ()
{
	for (var e = 0; e < H.MEM_MAX; ++e) {
		this.stomemory[e] = 0;
		this.njmemory[e] = 1; // position 0 is read-only and always returns 1.
	}
};

Hp12c_machine.prototype.cli = function ()
{
	H.keyboard.disable();
};

Hp12c_machine.prototype.sti = function ()
{
	H.keyboard.enable();
};

Hp12c_machine.prototype.clear_typing = function ()
{
	this.xmode = -1;
	this.typed_mantissa = "";
	this.typed_decimals = "";
	this.typed_mantissa_signal = 1;
	this.typed_exponent = "00";
	this.typed_exponent_signal = 1;
};

Hp12c_machine.prototype.display_result = function ()
{
	this.pushed = 0;
	this.clear_typing();
	H.display.displayNumber(this.x);
};

Hp12c_machine.prototype.display_all = function ()
{
	H.display.displayNumber(this.x);
	this.display_modifier();
	this.display_begin();
	this.display_dmyc();
	this.display_pgrm();
	this.display_algmode();
	this.display_trigo();
	this.display_user();
};

Hp12c_machine.prototype.pse2 = function ()
{
	this.sti();
	this.display_result();
};

Hp12c_machine.prototype.pse = function ()
{
	this.cli();
	var a = this;
	window.setTimeout(function () {
		a.pse2();
	}, 1000);
};

Hp12c_machine.prototype.toggle_decimal_character = function ()
{
	this.comma = this.comma ? 0 : 1;
	this.display_result();
	H.storage.save();
	console.log("Storage saved");
};

Hp12c_machine.prototype.display_result_date = function (dd)
{
	this.clear_typing();
	H.display.show(H.date_to_show(dd, this.dmy));
};

Hp12c_machine.prototype.clear_stack = function ()
{
	this.last_x = this.x = this.y = this.z = this.w = 0;
};

Hp12c_machine.prototype.clear_reg = function ()
{
	if (H.type !== "11c") {
		this.clear_stack();
	}
	this.alg_op = 0;
	this.index = 0;
	this.clear_fin();
	this.clear_sto();
	this.display_result();
};

// HP-12C Errors
// 0 = Division by zero, LN(negative) etc.
// 1 = STO + arith + memory position if memory position > 4
// 2 = statistics
// 3 = IRR
// 4 = Memory full (only happens in emulator when program typing reaches position 99+1)
// 5 = Composite interest
// 6 = CFj if j >= 30
// 7 = IRR
// 8 = Date

Hp12c_machine.prototype.display_pgrm = function ()
{
	H.display.show_pgrm(this.program_mode == H.PROGRAMMING, this.program_mode >= H.RUNNING,
							this.ip);
};

Hp12c_machine.prototype.display_trigo = function ()
{
	H.display.show_trigo(this.trigo);
};

Hp12c_machine.prototype.display_user = function ()
{
	H.display.show_user(this.user);
};

Hp12c_machine.prototype.display_algmode = function ()
{
	H.display.show_algmode(this.algmode);
};

Hp12c_machine.prototype.display_error = function (err)
{
	H.display.show_error(err);
	this.clear_typing();
	this.error_in_display = 1;

	if (this.program_mode >= H.RUNNING) {
		// errors stop programs
		H.pgrm.stop();
	}
};

Hp12c_machine.prototype.reset_error = function ()
{
	this.error_in_display = 0;
	if (this.program_mode == H.INTERACTIVE) {
		this.display_result();
	} else if (this.program_mode == H.PROGRAMMING) {
		this.display_program_opcode();
	}
};

Hp12c_machine.prototype.display_modifier2 = function (m)
{
	H.display.show_modifier(m);
};

Hp12c_machine.prototype.display_modifier = function ()
{
	this.display_modifier2(this.modifier);
};

Hp12c_machine.prototype.display_begin = function ()
{
	H.display.show_begin(this.begin);
};

Hp12c_machine.prototype.display_dmyc = function ()
{
	H.display.show_dmyc(this.dmy, this.compoundf);
};

Hp12c_machine.prototype.set_dmy = function (v)
{
	this.dmy = v;
	this.display_dmyc();
	this.display_result();
};

Hp12c_machine.prototype.set_trigo = function (v)
{
	this.trigo = v;
	this.display_trigo();
	this.display_result();
};

Hp12c_machine.prototype.rpn_mode = function ()
{
	this.algmode = 0;
	this.alg_op = 0;
	this.display_algmode();
	this.display_result();
};

Hp12c_machine.prototype.algebraic_mode = function ()
{
	this.algmode = 1;
	this.alg_op = 0;
	this.display_algmode();
	this.display_result();
};

Hp12c_machine.prototype.toggle_compoundf = function ()
{
	this.compoundf = this.compoundf ? 0 : 1;
	this.display_dmyc();
	this.display_result();
};

Hp12c_machine.prototype.toggle_user = function ()
{
	this.user = this.user ? 0 : 1;
	this.display_user();
	if (this.program_mode == H.INTERACTIVE) {
		this.display_result();
	}
};

Hp12c_machine.prototype.set_begin = function (v)
{
	this.begin = v;
	this.display_begin();
	this.display_result();
};

Hp12c_machine.prototype.set_modifier = function (v)
{
	this.modifier = v;
	if (v == H.GTO || v == H.GTO_MOVE) {
		// clean gto nn buffer on edge
		this.gto_buf_clear();
	}
	this.display_modifier();
};

Hp12c_machine.prototype.set_decimals = function (d, notation)
{
	this.notation = notation;
	this.decimals = d;
	this.display_result();
};

Hp12c_machine.prototype.set_decimals_exponential = function ()
{
	this.notation = H.NOTATION_SCI;
	this.decimals = 10;
	this.display_result();
};

Hp12c_machine.prototype.rst_modifier = function (df)
{
	if (df) {
		this.do_fincalc = 0;   // disarms financial calculation 
	}
	this.modifier = 0;
	this.display_modifier();
};

Hp12c_machine.prototype.push = function ()
{
	this.w = this.z;
	this.z = this.y;
	this.y = this.x;
	this.pushed = 1;
};

Hp12c_machine.prototype.digit_add = function (d)
{
	var number_signal;

	if (this.xmode == -1) {
		if (! this.pushed) {
			this.push(); // push stack when result is immediately followed by typing
		}
		// just displayed a result
		this.clear_typing();
		this.typed_mantissa = "" + d;
		this.xmode = 0;
	} else if (this.xmode === 0) {
		if (this.typed_mantissa.length < H.display.display_len) {
			this.typed_mantissa += "" + d;
		}
	} else if (this.xmode == 1) {
		if ((this.typed_mantissa.length + this.typed_decimals.length) < H.display.display_len) {
			this.typed_decimals += "" + d;
		}
	} else if (this.xmode == 100) {
		this.typed_exponent = this.typed_exponent.substr(1, 1);
		this.typed_exponent += "" + d;
	}

	this.display_typing();
};

Hp12c_machine.prototype.display_typing = function ()
{
	this.x = this.typed_mantissa_signal * 
		parseFloat(this.typed_mantissa + "." + this.typed_decimals + "0") * 
		Math.pow(10, parseInt("0" + this.typed_exponent, 10) * this.typed_exponent_signal);
	H.display.displayTypedNumber(this.typed_mantissa_signal, this.typed_mantissa,
		this.typed_decimals, this.typed_exponent, this.typed_exponent_signal,
		this.xmode);
};

Hp12c_machine.prototype.digit_delete = function ()
{
	var number_signal;
	var i;

	if (this.xmode == -1) {
		if (H.type == "11c") {
			// this key actually exists in 11c (only)
			this.x = 0;

			// changes to in-place number editing
			// (does not push again when new number is typed)
			this.pushed = 1;

			H.display.displayNumber(this.x);
		} else {
			// does nothing
		}
		return;
	}

	if (this.xmode === 0) {
		i = this.typed_mantissa.length - 1;
		if (i >= 0) {
			this.typed_mantissa = this.typed_mantissa.substr(0, i);
		}
	} else if (this.xmode == 1) {
		i = this.typed_decimals.length - 1;
		if (i < 0) {
			// decimal point mode but no decimal typed
			this.xmode = 0;
		} else {
			this.typed_decimals = this.typed_decimals.substr(0, i);
		}
	} else if (this.xmode == 100) {
		this.typed_exponent = "";
		if (this.typed_decimals.length > 0) {
			this.xmode = 1;
		} else {
			this.xmode = 0;
		}
	}

	this.display_typing();
};

Hp12c_machine.prototype.input_exponential = function ()
{
	if (this.xmode == -1) {
		if (! this.pushed) {
			this.push(); // push stack when result is immediately followed by typing
		}
		this.clear_typing();
		this.typed_mantissa = "1";

	} else if (this.xmode != 100) {
		if (this.typed_mantissa.length > (H.display.display_len - 3)) {
			// too long; refuse
			return;
		}

		if (parseInt("0" + this.typed_mantissa, 10) === 0) {
			// no integer part

			this.typed_mantissa = "0";

			var val_dec = parseInt("0" + this.typed_decimals, 10);

			if (val_dec === 0) {
				// both integer and decimal parts all zero
				this.typed_mantissa = "1";
			} else {
				// test for irreductible decimals like 0.000000001
				var n_dec = val_dec.toFixed(0);
				var zeros = this.typed_decimals.length - ("" + n_dec).length;

				// if no decimal typed yet, zeros gets -1
				zeros = Math.max(0, zeros);
			
				if ((this.typed_mantissa.length + zeros) >=
						(H.display.display_len - 3)) {
					// too long; refuse
					return;
				}
			}
		}
	}

	this.xmode = 100;
	this.display_typing();
};

Hp12c_machine.prototype.decimal_point_mode = function ()
{
	if (this.xmode == -1) {
		// just displayed a result
		if (! this.pushed) {
			this.push(); // push stack when result is immediately followed by typing
		}
		this.clear_typing();
	}

	if (this.typed_mantissa.length <= 0) {
		this.typed_mantissa = "0";
	}

	this.xmode = 1;
	this.display_typing();
};

Hp12c_machine.prototype.chs = function ()
{
	if (this.xmode == -1) {
		// result mode
		this.x = -this.x;
		this.display_result();
		return;
	}

	if (this.xmode == 100) {
		// input mode, inputting exponential
		this.typed_exponent_signal *= -1;
	} else {
		this.typed_mantissa_signal *= -1;
	}

	this.display_typing();
};

Hp12c_machine.prototype.pop = function ()
{
	this.x = this.y;
	this.y = this.z;
	this.z = this.w;
};

Hp12c_machine.prototype.save_lastx = function ()
{
	if (! this.algmode) {
		this.last_x = this.x;
	}
};

Hp12c_machine.prototype.lstx = function ()
{
	this.push();
	this.x = this.last_x;
	this.display_result();
};

Hp12c_machine.prototype.shv = function ()
{
	this.push();
	this.x = H.sve;
	this.display_result();
};

Hp12c_machine.prototype.apocryphal = function (i)
{
	// to be overridden as necessary; this is here just for testing
	this.push();
	this.x = 140 + i;
	this.display_result();
};

Hp12c_machine.prototype.clear_prefix2 = function ()
{
	this.sti();
	this.display_result();
};

Hp12c_machine.prototype.clear_prefix = function ()
{
	var n = Math.abs(this.x);
	var order = Math.log(n) / Math.log(10);

	if (H.badnumber(order)) {
		// tends to zero
		order = 1;
	}

	if (order == Math.floor(order)) {
		order += 0.1;
	}

	n = n * Math.pow(10, H.display.display_len - Math.ceil(order));

	this.cli();

	H.display.show(H.zeropad(n.toFixed(0), H.display.display_len));

	var self = this;
	window.setTimeout(function () {
		self.clear_prefix2();
	}, 1000);
};

Hp12c_machine.prototype.x_exchange_y = function ()
{
	var tmp = this.x;
	this.x = this.y;
	this.y = tmp;
	this.display_result();
};

Hp12c_machine.prototype.fix_index = function ()
{
	var index = Math.floor(Math.abs(this.index));
	if (index >= H.MEM_MAX) {
		this.display_error(H.ERROR_INDEX);
		return null;
	}
	return index;
};

Hp12c_machine.prototype.x_exchange_index = function ()
{
	var index = this.fix_index();

	if (index === null) {
		return;
	}

	var tmp = this.x;
	this.x = this.stomemory[index];
	this.stomemory[this.index] = tmp;
	this.display_result();
};

Hp12c_machine.prototype.x_exchange_index_itself = function ()
{
	var tmp = this.x;
	this.x = this.index;
	this.index = tmp;
	this.display_result();
};

Hp12c_machine.prototype.mem_info = function ()
{
	H.display.display_meminfo(this.ram_available(), this.stomemory.length);
	this.error_in_display = 1;
};

Hp12c_machine.prototype.sf = function (i)
{
	if (i >= this.flags.length) {
		this.display_error(H.ERROR_FLAG);
		return;
	}

	this.flags[i] = 1;
};

Hp12c_machine.prototype.cf = function (i)
{
	if (i >= this.flags.length) {
		this.display_error(H.ERROR_FLAG);
		return;
	}

	this.flags[i] = 0;
};

Hp12c_machine.prototype.f_question = function (i)
{
	if (i >= this.flags.length) {
		this.display_error(H.ERROR_FLAG);
		return;
	}

	this.incr_ip(this.flags[i] ? 0 : 1);

	this.display_result();
};

Hp12c_machine.prototype.dissect_index = function ()
{
	var sgn = H.binary_sgn(this.index);
	var index = H.cl5_round(Math.abs(this.index), 5);
	var counter = Math.floor(index) * sgn;
	index -= sgn * counter;
	index *= 1000;
	var cmp = Math.floor(index + 0.001);
	index = Math.max(0, index - cmp);
	index *= 100;
	var incr = Math.floor(index + 0.1);
	return [counter, cmp, incr];
};

Hp12c_machine.prototype.update_index = function (counter, cmp, incr)
{
	var sgn = H.binary_sgn(counter);
	counter = Math.abs(counter);
	this.index = sgn * (counter + cmp / 1000 + incr / 100000);
};

Hp12c_machine.prototype.f_isg = function ()
{
	var res = this.dissect_index();
	var counter = res[0], cmp = res[1], incr = res[2];

	counter += (incr === 0 ? 1 : incr);
	this.incr_ip(counter > cmp ? 1 : 0);
	this.update_index(counter, cmp, incr);
};

Hp12c_machine.prototype.f_dse = function ()
{
	var res = this.dissect_index();
	var counter = res[0], cmp = res[1], incr = res[2];

	counter -= (incr === 0 ? 1 : incr);
	// note that cmp >= 0; a negative counter means this is always True
	this.incr_ip(counter <= cmp ? 1 : 0);
	this.update_index(counter, cmp, incr);
};

Hp12c_machine.prototype.r_down = function ()
{
	var tmp = this.x;
	this.x = this.y;
	this.y = this.z;
	this.z = this.w;
	this.w = tmp;
	this.display_result();
};

Hp12c_machine.prototype.r_up = function ()
{
	var tmp = this.x;
	this.x = this.w;
	this.w = this.z;
	this.z = this.y;
	this.y = tmp;
	this.display_result();
};

Hp12c_machine.prototype.clx = function ()
{
	this.x = 0;
	this.display_result();
	this.pushed = 1; // do not push if user retries typing
};

Hp12c_machine.prototype.arithmetic = function (res, a, b)
{
	this.save_lastx();
	this.pop();
	this.x = H.arithmetic_round(res, a, b);
	this.display_result();
};

Hp12c_machine.prototype.alg_resolve = function ()
{
	var res;
	var ok = 1;

	if ((! this.algmode) || (this.alg_op <= 0)) {
		return ok;
	}

	if (this.alg_op == this.ALG_PLUS) {
		this.arithmetic(this.y + this.x, this.x, this.y);
	} else if (this.alg_op == this.ALG_MINUS) {
		this.arithmetic(this.y - this.x, this.x, this.y);
	} else if (this.alg_op == this.ALG_MULTIPLY) {
		this.arithmetic(this.y * this.x, 0, 0);
	} else if (this.alg_op == this.ALG_DIVIDE) {
		res = this.y / this.x;
		if (H.badnumber(res)) {
			this.display_error(H.ERROR_DIVZERO);
			ok = 0;
		} else {
			this.arithmetic(res, 0, 0);
		}
	} else if (this.alg_op == this.ALG_POWER) {
		res = Math.pow(this.y, this.x);
		if (H.badnumber(res)) {
			this.display_error(H.ERROR_DIVZERO);
			ok = 0;
		} else {
			this.arithmetic(res, 0, 0);
		}
	}
	this.alg_op = 0;
	return ok;
};

Hp12c_machine.prototype.enter = function (g_modifier)
{
	if (this.algmode && this.alg_op) {
		this.alg_resolve();
	} else if (! this.algmode || ! g_modifier) {
		// pushes only if not =, or not in alg mode
		this.push();
		this.display_result();
		this.pushed = 1; // already pushed, do not push twice when user types new number
	} else {
		this.display_result();
	}
};

Hp12c_machine.prototype.plus = function ()
{ 
	if (this.algmode) {
		if (! this.alg_resolve()) {
			return;
		}
		this.alg_op = this.ALG_PLUS;
		this.push();
		this.display_result();
	} else {
		this.arithmetic(this.y + this.x, this.x, this.y);
	}
};

Hp12c_machine.prototype.minus = function ()
{
	if (this.algmode) {
		if (! this.alg_resolve()) {
			return;
		}
		this.alg_op = this.ALG_MINUS;
		this.push();
		this.display_result();
	} else {
		this.arithmetic(this.y - this.x, this.x, this.y);
	}
};

Hp12c_machine.prototype.multiply = function ()
{
	if (this.algmode) {
		if (! this.alg_resolve()) {
			return;
		}
		this.alg_op = this.ALG_MULTIPLY;
		this.push();
		this.display_result();
	} else {
		this.arithmetic(this.y * this.x, 0, 0);
	}
};

Hp12c_machine.prototype.divide = function ()
{
	if (this.algmode) {
		if (! this.alg_resolve()) {
			return;
		}
		this.alg_op = this.ALG_DIVIDE;
		this.push();
		this.display_result();
	} else {
		var res = this.y / this.x;
		if (H.badnumber(res)) {
			this.display_error(H.ERROR_DIVZERO);
		} else {
			this.arithmetic(res, 0, 0);
		}
	}
};

Hp12c_machine.prototype.poweryx = function ()
{ 
	if (this.algmode) {
		if (! this.alg_resolve()) {
			return;
		}
		this.alg_op = this.ALG_POWER;
		this.push();
		this.display_result();
	} else {
		var res = Math.pow(this.y, this.x);
		if (H.badnumber(res)) {
			this.display_error(H.ERROR_DIVZERO);
		} else {
			this.arithmetic(res, 0, 0);
		}
	}
};

Hp12c_machine.prototype.power10 = function () // 11C
{ 
	var res = Math.pow(10.0, this.x);
	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.reciprocal = function ()
{
	var res = 1 / this.x;
	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.square = function ()
{
	var res = Math.pow(this.x, 2);
	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.sqroot = function ()
{
	var res = Math.pow(this.x, 0.5);
	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.exp = function ()
{
	var res = Math.exp(this.x);
	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.ln = function ()
{
	var res = Math.log(this.x);
	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.log10 = function () // 11C
{
	var res = Math.log(this.x) / Math.log(10);
	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.trig = function (f) // 11C
{
	var res = Math[f](H.radians(this.x, this.trigo));
	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.triginv = function (f) // 11C
{
	var res = Math[f](this.x);
	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = H.to_angle_mode(res, this.trigo);
		this.display_result();
	}
};

Hp12c_machine.prototype.htrig = function (f) // 11C
{
	var res = H[f].call(null, this.x);
	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.htriginv = function (f) // 11C
{
	var res = H[f].call(null, this.x);
	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.intg = function ()
{
	this.save_lastx();
	this.x = Math.floor(Math.abs(this.x)) * H.binary_sgn(this.x);
	this.display_result();
};

Hp12c_machine.prototype.abs = function ()
{
	this.save_lastx();
	this.x = Math.abs(this.x);
	this.display_result();
};

Hp12c_machine.prototype.to_radians = function ()
{
	this.save_lastx();
	this.x = H.degrees_to_radians(this.x);
	this.display_result();
};

Hp12c_machine.prototype.to_degrees = function ()
{
	this.save_lastx();
	this.x = H.radians_to_degrees(this.x);
	this.display_result();
};

Hp12c_machine.prototype.to_hms = function ()
{
	this.save_lastx();
	this.x = H.hour_to_hms(this.x);
	this.display_result();
};

Hp12c_machine.prototype.to_hour = function ()
{
	this.save_lastx();
	this.x = H.hms_to_hour(this.x);
	this.display_result();
};

Hp12c_machine.prototype.pi = function ()
{
	this.push();
	this.x = Math.PI;
	this.display_result();
};

Hp12c_machine.prototype.random = function ()
{
	// TODO discover real random algorithm of 11c
	this.push();
	this.x = Math.random();
	this.display_result();
};

Hp12c_machine.prototype.random_sto = function ()
{
	// TODO actually use x as random seed 
	this.display_result();
};

Hp12c_machine.prototype.rnd = function ()
{
	this.save_lastx();
	this.x = H.cl5_round(this.x, this.decimals);
	this.display_result();
};

Hp12c_machine.prototype.polar = function ()
{
	var res = H.polar(this.x, this.y);
	var r = res[0];
	var angle = res[1];

	if (H.badnumber(r) || H.badnumber(angle)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = r;
		this.y = H.to_angle_mode(angle, this.trigo);
		this.display_result();
	}
};

Hp12c_machine.prototype.orthogonal = function ()
{
	var r = this.x;
	var angle = H.radians(this.y, this.trigo);
	var res = H.orthogonal(r, angle);
	var x = res[0];
	var y = res[1];

	if (H.badnumber(x) || H.badnumber(y)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = x;
		this.y = y;
		this.display_result();
	}
};

Hp12c_machine.prototype.fatorial = function ()
{
	if (H.type != "11c" && (this.x < 0 || this.x != Math.floor(this.x))) {
		this.display_error(H.ERROR_DIVZERO);
		return;
	}

	if (this.x > 69.95) {
		this.save_lastx();
		this.x = H.value_max;
		this.display_result();
		return;
	}

	var res;

	if (H.type === "11c") {
		res = H.fatorial_gamma(this.x);
	} else {
		res = H.fatorial(this.x);
	}

	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
		return;
	}

	this.save_lastx();
	this.x = res;
	this.display_result();
};

Hp12c_machine.prototype.frac = function ()
{
	this.save_lastx();
	this.x = (Math.abs(this.x) - Math.floor(Math.abs(this.x))) * H.binary_sgn(this.x);
	this.display_result();
};

Hp12c_machine.prototype.percent = function ()
{
	var res = this.y * this.x / 100;
	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.percentT = function ()
{
	if (! this.alg_resolve()) {
		return;
	}

	var res = 100 * this.x / this.y;
	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.deltapercent = function ()
{
	if (! this.alg_resolve()) {
		return;
	}

	var res = 100 * (this.x / this.y) - 100;

	if (H.badnumber(res)) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.sto = function (pos)
{
	this.stomemory[pos] = this.x;
	this.display_result();
};

Hp12c_machine.prototype.sto_index = function (pos)
{
	var index = this.fix_index();

	if (index === null) {
		return;
	}

	this.stomemory[index] = this.x;
	this.display_result();
};

Hp12c_machine.prototype.get_index = function ()
{
	this.push();
	this.x = this.index;
	this.display_result();
};

Hp12c_machine.prototype.set_index = function ()
{
	this.index = this.x;
	this.display_result();
};

Hp12c_machine.prototype.stoinfix_index = function (operation)
{
	var index = this.fix_index();

	if (index === null) {
		return;
	}

	this.stoinfix(index, operation);
};

Hp12c_machine.prototype.stoinfix = function (pos, operation)
{
	var a = this.stomemory[pos];
	if (operation ==  H.STO_PLUS) {
		a += this.x;
	} else if (operation == H.STO_MINUS) {
		a -= this.x;
	} else if (operation == H.STO_TIMES) {
		a *= this.x;
	} else if (operation == H.STO_DIVIDE) {
		a /= this.x;
		if (H.badnumber(a)) {
			this.display_error(H.ERROR_DIVZERO);
			return;
		}
	}
	if (Math.abs(a) > H.value_max) {
		this.display_error(H.ERROR_OVERFLOW);
		return;
	}

	this.stomemory[pos] = a;
	this.display_result();
};

Hp12c_machine.prototype.stoCF0 = function ()
{
	this.stomemory[0] = this.x;
	this.finmemory[H.FIN_N] = 0;
	this.display_result();
};

Hp12c_machine.prototype.stoCFj = function ()
{
	if (this.finmemory[H.FIN_N] != Math.floor(this.finmemory[H.FIN_N]) ||
	    this.finmemory[H.FIN_N] < 0 ||
	    this.finmemory[H.FIN_N] >= H.MEM_MAX) {
		this.display_error(H.ERROR_MEMORY);
	} else {
		this.finmemory[H.FIN_N]++;
		this.stomemory[this.finmemory[H.FIN_N]] = this.x;
		this.njmemory[this.finmemory[H.FIN_N]] = 1; 
		this.display_result();
	}
};

Hp12c_machine.prototype.rclCFj = function ()
{
	if (this.finmemory[H.FIN_N] < 0 ||
	    this.finmemory[H.FIN_N] >= H.MEM_MAX ||
	    Math.floor(this.finmemory[H.FIN_N]) != this.finmemory[H.FIN_N]) {
		this.display_error(H.ERROR_MEMORY);
	} else {
		this.push();
		this.x = this.stomemory[this.finmemory[H.FIN_N]];
		--this.finmemory[H.FIN_N];
		this.display_result();
	}
};

Hp12c_machine.prototype.rclNj = function ()
{
	if (this.finmemory[H.FIN_N] < 0 ||
            this.finmemory[H.FIN_N] >= H.MEM_MAX ||
            Math.floor(this.finmemory[H.FIN_N]) != this.finmemory[H.FIN_N]) {
		this.display_error(H.ERROR_MEMORY);
	} else {
		this.push();
		this.x = this.njmemory[this.finmemory[H.FIN_N]];
		this.display_result();
	}
};

Hp12c_machine.prototype.stoNj = function ()
{
	if (this.finmemory[H.FIN_N] != Math.floor(this.finmemory[H.FIN_N]) ||
            this.finmemory[H.FIN_N] < 0 ||
            this.finmemory[H.FIN_N] >= H.MEM_MAX ||
	    this.x != Math.floor(this.x) || this.x <= 0) {
		this.display_error(H.ERROR_MEMORY);
	} else {
		this.njmemory[this.finmemory[H.FIN_N]] = this.x;
		this.display_result();
	}
};

Hp12c_machine.prototype.stofin = function (pos)
{
	this.finmemory[pos] = this.x;
	this.display_result();
	this.pushed = 1;
	this.do_fincalc = 1; // next fin. key runs calculation
};

Hp12c_machine.prototype.ston_12x = function ()
{
	var res = this.x * 12;
	if (Math.abs(res) > H.value_max) {
		this.display_error(H.ERROR_OVERFLOW);
		return;
	}
	this.x = res;
	this.stofin(0);
};

Hp12c_machine.prototype.stoi_12div = function ()
{
	this.x /= 12;
	this.stofin(1);
};

Hp12c_machine.prototype.rcl = function (pos)
{
	this.push(); // every RCL pushes the result to stack
	this.x = this.stomemory[pos];
	this.display_result();
};

Hp12c_machine.prototype.rcl_index = function (pos)
{
	var index = this.fix_index();

	if (index === null) {
		return;
	}

	this.push(); // every RCL pushes the result to stack
	this.x = this.stomemory[index];
	this.display_result();
};

Hp12c_machine.prototype.rclfin = function (pos)
{
	this.push(); // every RCL pushes the result to stack
	this.x = this.finmemory[pos];
	this.display_result();
};

Hp12c_machine.prototype.stat_sigma_rcl = function ()
{
	this.push();
	this.push();
	this.x = this.stomemory[H.STAT_X];
	this.y = this.stomemory[H.STAT_Y];
	this.display_result();
};

Hp12c_machine.prototype.stat_sigma_plus = function ()
{
	if (! this.alg_resolve()) {
		return;
	}

	H.stat_accumulate(+1, this.stomemory, this.x, this.y);
	this.save_lastx();
	this.x = this.stomemory[H.STAT_N];
	this.display_result();
	this.pushed = 1;
};

Hp12c_machine.prototype.stat_sigma_minus = function ()
{
	if (! this.alg_resolve()) {
		return;
	}

	H.stat_accumulate(-1, this.stomemory, this.x, this.y);
	this.save_lastx();
	this.x = this.stomemory[H.STAT_N];
	this.display_result();
	this.pushed = 1;
};

Hp12c_machine.prototype.stat_avgw = function ()
{
	this.alg_op = 0;

	var res = H.stat_avgw(this.stomemory);
	
	if (! res[0]) {
		this.display_error(H.ERROR_STAT);
	} else {
		this.save_lastx();
		this.x = res[1];
		this.display_result();
	}
};

Hp12c_machine.prototype.stat_avg = function ()
{
	this.alg_op = 0;

	var res = H.stat_avg(this.stomemory);

	if (! res[0]) {
		this.display_error(H.ERROR_STAT);
	} else {
		this.save_lastx();
		this.push();
		this.x = res[1];
		this.y = res[2];
		this.display_result();
	}
};

Hp12c_machine.prototype.stat_stddev = function ()
{
	this.alg_op = 0;

	var res = H.stddev(this.stomemory);
	if (! res[0]) {
		this.display_error(H.ERROR_STAT);
		return;
	}

	this.save_lastx();
	this.push();
	this.x = res[1];
	this.y = res[2];
	this.display_result();
};

Hp12c_machine.prototype.stat_lr = function (is_x)
{
	this.alg_op = 0;

	var res = H.stat_kr(this.stomemory, is_x, this.x);
	if (! res[0]) {
		this.display_error(H.ERROR_STAT);
	} else {
		this.save_lastx();
		this.push();
		this.x = res[1];
		this.y = res[2];
		this.display_result();
	}
};

Hp12c_machine.prototype.stat_linearregression = function ()
{
	this.alg_op = 0;

	var res = H.linear_regression(this.stomemory);
	if (! res[0]) {
		this.display_error(H.ERROR_STAT);
	} else {
		this.save_lastx();
		this.push();
		this.push();
		this.x = res[1]; // B
		this.y = res[2]; // A
		this.display_result();
	}
};

Hp12c_machine.prototype.permutations = function ()
{
	if (this.x < 0 || this.x != Math.floor(this.x) || this.x > 80 ||
	    this.y < 0 || this.y != Math.floor(this.y) || this.y > 80 ||
	    this.y < this.x) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		var res = H.permutations(this.y, this.x);
		if (H.badnumber(res)) {
			this.display_error(H.ERROR_DIVZERO);
			return;
		}
		this.pop();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.combinations = function ()
{
	if (this.x < 0 || this.x != Math.floor(this.x) || this.x > 80 ||
	    this.y < 0 || this.y != Math.floor(this.y) || this.y > 80 ||
	    this.y < this.x) {
		this.display_error(H.ERROR_DIVZERO);
	} else {
		this.save_lastx();
		var res = H.combinations(this.y, this.x);
		if (H.badnumber(res)) {
			this.display_error(H.ERROR_DIVZERO);
			return;
		}
		this.pop();
		this.x = res;
		this.display_result();
	}
};

Hp12c_machine.prototype.simple_interest = function ()
{
	if (! this.alg_resolve()) {
		return;
	}

	var n = this.finmemory[H.FIN_N];
	var i = this.finmemory[H.FIN_I] / 100;
	var pv = this.finmemory[H.FIN_PV];
	this.push();
	this.push();
	this.push();
	this.x = n / 360 * -pv * i;
	this.y = -pv;
	this.z = n / 365 * -pv * i;
	this.display_result();
};

Hp12c_machine.prototype.fincalc2 = function (pos)
{
	this.sti();
	var err = H.financecalc(pos, this.begin, this.compoundf, this.finmemory);
	if (err == -1) {
		// no error
		this.x = this.finmemory[pos];
		this.display_result();
	} else {
		this.display_error(err);
	}
};

Hp12c_machine.prototype.sto_or_calc_fin = function (pos)
{
	if (! this.alg_resolve()) {
		return;
	}

	if (! this.do_fincalc) {
		this.stofin(pos);
	} else {
		this.cli();
		H.display.show("running");
		var a = this;
		window.setTimeout(function () {
			a.fincalc2(pos);
		}, 200);
	}
};

Hp12c_machine.prototype.npv = function ()
{
	this.alg_op = 0;
	this.push();
	this.x = H.npv(this.finmemory[H.FIN_N], this.finmemory[H.FIN_I], this.stomemory, this.njmemory);
	this.finmemory[H.FIN_PV] = this.x;
	this.display_result();
};

Hp12c_machine.prototype.irr = function ()
{
	this.alg_op = 0;

	H.display.show("running");
	var res = H.irr_calc(this.finmemory[H.FIN_N], this.finmemory[H.FIN_I], this.stomemory, this.njmemory);
	var err = res[0];
	this.finmemory[H.FIN_I] = res[1];
	if (err != -1) {
		this.display_error(err);
	} else {
		this.push();
		this.x = this.finmemory[H.FIN_I];
		this.display_result();
	}
};


Hp12c_machine.prototype.date_date = function ()
{
	this.alg_op = 0;

	var base = H.date_interpret(this.y, this.dmy);
	if (base === null) {
		this.display_error(H.ERROR_DATE);
		return;
	}
	this.save_lastx();
	H.date_add(base, this.x);
	this.pop(); // eat original arguments 
	this.x = H.date_gen(base, this.dmy); // and fill with newly calculated date
	this.display_result_date(base);
};

Hp12c_machine.prototype.date_dys = function ()
{
	this.alg_op = 0;

	var d2 = H.date_interpret(this.x, this.dmy);
	var d1 = H.date_interpret(this.y, this.dmy);
	if ((d1 === null) || (d2 === null)) {
		this.display_error(H.ERROR_DATE);
		return;
	}
	this.save_lastx();
	this.x = H.date_diff(d1, d2);
	this.y = H.date_diff30(d1, d2);
	this.display_result();
};

Hp12c_machine.prototype.amortization = function ()
{
	this.alg_op = 0;

	var requested_n = this.x;
	var orig_n = this.finmemory[H.FIN_N];
	var i = this.finmemory[H.FIN_I] / 100;

	// AMORT rounds present value to shown decimals
	var pv = H.cl5_round(this.finmemory[H.FIN_PV], this.decimals);
	this.finmemory[H.FIN_PV] = pv;

	// AMORT rounds payment to shown decimals
	var pmt = H.cl5_round(this.finmemory[H.FIN_PMT], this.decimals);
	this.finmemory[H.FIN_PMT] = pmt;

	var res = H.amortization(requested_n, orig_n, i, pv, pmt, this.decimals, this.begin);
	var err = res[0];
	var tot_interest = res[1];
	var tot_amort = res[2];

	this.push();
	this.push();
	this.x = tot_interest; 
	this.y = tot_amort;
	this.z = requested_n;
	this.finmemory[H.FIN_N] += requested_n;
	this.finmemory[H.FIN_PV] += tot_amort;

	this.display_result();
};

Hp12c_machine.prototype.bond_price = function ()
{
	this.alg_op = 0;

	var desired_rate = this.finmemory[H.FIN_I];
	if (desired_rate <= -100) {
		this.display_error(H.ERROR_INTEREST);
		return;
	}

	var coupon_year = this.finmemory[H.FIN_PMT];

	var buy = H.date_interpret(this.y, this.dmy);
	if (buy === null) {
		this.display_error(H.ERROR_DATE);
		return;
	}

	var maturity = H.date_interpret(this.x, this.dmy);
	if (maturity === null) {
		this.display_error(H.ERROR_DATE);
		return;
	}

	var res = H.bond_price(desired_rate, coupon_year, buy, maturity);

	if (! res) {
		this.display_error(H.ERROR_INTEREST);
		return;
	} else if (res[0] >= 0) {
		this.display_error(res[0]);
		return;
	}

	this.push();
	this.push();
	this.finmemory[H.FIN_N] = this.x = res[1];
	this.y = res[2];
	this.display_result();
};

Hp12c_machine.prototype.bond_yield = function ()
{
	this.alg_op = 0;

	var coupon_year = this.finmemory[H.FIN_PMT];
	var buy = H.date_interpret(this.y, this.dmy);
	var maturity = H.date_interpret(this.x, this.dmy);
	var price = this.finmemory[H.FIN_PV];

	var res = H.bond_yield(coupon_year, buy, maturity, price);

	var err = res[0];
	var desired_rate = res[1];

	if (err >= 0) {
		this.display_error(err);
		return;
	}

	this.push();
	this.finmemory[H.FIN_I] = this.x = desired_rate;
	this.display_result();
};


Hp12c_machine.prototype.depreciation_sl = function ()
{
	this.alg_op = 0;

	var cost = this.finmemory[H.FIN_PV];
	var sell = this.finmemory[H.FIN_FV];
	var life = this.finmemory[H.FIN_N];
	var year = this.x;

	var res = H.depreciation_sl(cost, sell, life, year);
	var err = res[0];
	var depr = res[1];
	var rest = res[2];

	if (err >= 0) {
		this.display_error(err);
		return;
	}
	
	this.push();
	this.push();
	this.x = depr;
	this.y = rest;
	this.display_result();
};

Hp12c_machine.prototype.depreciation_soyd = function ()
{
	this.alg_op = 0;

	var cost = this.finmemory[H.FIN_PV];
	var sell = this.finmemory[H.FIN_FV];
	var life = this.finmemory[H.FIN_N];
	var year = this.x;

	var res = H.depreciation_soyd(cost, sell, life, year);
	var err = res[0];
	var depr = res[1];
	var rest = res[2];

	if (err >= 0) {
		this.display_error(err);
		return;
	}
	
	this.push();
	this.push();
	this.x = depr;
	this.y = rest;
	this.display_result();
};

Hp12c_machine.prototype.depreciation_db = function ()
{
	this.alg_op = 0;

	var cost = this.finmemory[H.FIN_PV];
	var sell = this.finmemory[H.FIN_FV];
	var life = this.finmemory[H.FIN_N];
	var year = this.x;
	var db = this.finmemory[H.FIN_I] / 100;

	var res = H.depreciation_db(cost, sell, life, year, db);
	var err = res[0];
	var depr = res[1];
	var rest = res[2];

	if (err >= 0) {
		this.display_error(err);
		return;
	}

	this.push();
	this.push();
	this.x = depr;
	this.y = rest;
	this.display_result();
};

Hp12c_machine.prototype.display_program_opcode = function ()
{
	var txt = H.zeropad(this.ip.toFixed(0), H.ram_ADDR_SIZE) +
				"-" + this.ram[this.ip];
	H.display.show(txt);
};

Hp12c_machine.prototype.prog_pr = function ()
{
	if (this.program_mode == H.INTERACTIVE) {
		this.program_mode = H.PROGRAMMING;
		// NOTE: entering programming mode does not reset instruction pointer
		// this.ip = 0;
		this.display_pgrm();
		this.display_program_opcode();
	}
};

Hp12c_machine.prototype.prog_bst_after = function ()
{
	this.sti();
	this.display_result();
};

Hp12c_machine.prototype.gto_digit_add = function (n)
{
	this.gtoxx = "" + this.gtoxx + n.toFixed(0);
	if (this.gtoxx.length >= H.ram_ADDR_SIZE) {
		var new_ip = parseInt(this.gtoxx, 10);
		this.gtoxx = "";
		this.rst_modifier(); // OK

		if (new_ip > this.program_limit()) {
			this.display_error(H.ERROR_IP);
			return;
		}

		this.ip = new_ip;
	}
};

Hp12c_machine.prototype.test_x_le_y = function ()
{
	this.display_result();
	this.incr_ip(this.x <= this.y ? 0 : 1);
};

Hp12c_machine.prototype.test_x_gt_y = function ()
{
	this.display_result();
	this.incr_ip(this.x > this.y ? 0 : 1);
};

Hp12c_machine.prototype.test_x_eq_y = function ()
{
	this.display_result();
	this.incr_ip(H.feq10(this.x, this.y) ? 0 : 1);
};

Hp12c_machine.prototype.test_x_ne_y = function ()
{
	this.display_result();
	this.incr_ip((!H.feq10(this.x, this.y)) ? 0 : 1);
};

Hp12c_machine.prototype.test_x_less_0 = function ()
{
	this.display_result();
	this.incr_ip(this.x < 0 ? 0 : 1);
};

Hp12c_machine.prototype.test_x_gt_0 = function ()
{
	this.display_result();
	this.incr_ip(this.x > 0 ? 0 : 1);
};

Hp12c_machine.prototype.test_x_le_0 = function ()
{
	this.display_result();
	this.incr_ip(this.x <= this.y ? 0 : 1);
};

Hp12c_machine.prototype.test_x_eq0 = function ()
{
	this.display_result();
	this.incr_ip(H.feq10(this.x, 0) ? 0 : 1);
};

Hp12c_machine.prototype.test_x_ne0 = function ()
{
	this.display_result();
	this.incr_ip((!H.feq10(this.x, 0)) ? 0 : 1);
};

Hp12c_machine.prototype.gto_buf_clear = function ()
{
	this.gtoxx = "";
};

Hp12c_machine.prototype.nop = function ()
{
};
/* HP-12C emulator 
 * Copyright (c) 2011 EPx.com.br.
 * All rights reserved.
 */

/*jslint white: true, undef: true, nomen: true, regexp: true, strict: true, browser: true, bitwise: true */
/*global H */

"use strict";

H.INTERPOLATION_MAX = 50;

H.solve_infinity = function (val)
{
	if (val > Math.pow(10, 95)) {
		val = Math.pow(10, 95);
	} else if (val < -Math.pow(10, 95)) {
		val = -Math.pow(10, 95);
	}
	return val;
};

H.npv = function (n, i, cfj, nj)
{
	var res = cfj[0];
	var pmt = 0;
	for (var e = 1; e <= n; ++e) {
		var cf = cfj[e];
		for (var f = 1; f <= nj[e]; ++f) {
			++pmt;
			res += cf / Math.pow(1 + (i / 100), pmt);
		}
	}
	return res;
};

H.comppmtlim = function (i, n)
{
	if (Math.abs(i) < 0.00000001) {
		return n;
	} else {
		return (1 - Math.pow(1 + (i / 100), -n)) / (i / 100);
	}
};

H.calcNPV = function (is_n, n, i, pv, pmt, fv, begin, compoundf)
{
	if (n == Math.floor(n) || is_n) {
		return pv + 
			(1 + (i / 100) * (begin ? 1:0)) * pmt * H.comppmtlim(i, n) + 
			fv * Math.pow(1 + (i / 100), -n);
	} else if (! compoundf) {
		return pv * (1 + ((i / 100) * (n - Math.floor(n)))) + 
			(1 + (i / 100) * (begin ? 1:0)) * pmt * H.comppmtlim(i, Math.floor(n)) +
			fv * Math.pow(1 + (i / 100), -Math.floor(n));
	} else {
		return pv * Math.pow(1 + (i / 100), (n - Math.floor(n))) + 
			(1 + (i / 100) * (begin ? 1 : 0)) * pmt * H.comppmtlim(i, Math.floor(n)) +
			fv * Math.pow(1 + (i / 100), -Math.floor(n));
	}
};

H.bond_previous_coupon = function (buy, maturity)
{
	// calculates last coupon paid just before buy

	var coupons = 0;
	var last_coupon = new Date(maturity);
	var next_coupon;

	while (last_coupon > buy) {
		next_coupon = new Date(last_coupon);
		++coupons;
		last_coupon.setDate(1);
		last_coupon.setMonth(last_coupon.getMonth() - 6);
		var month = last_coupon.getMonth();
		last_coupon.setDate(maturity.getDate());
	
		if (last_coupon.getMonth() != month) {
			// day > 28, overflowed into next month
			// Javascript trick: set to day 0 goes to last day of previous month
			// last_coupon.setDate(0);
			
			// We *could* do this calculation, but HP-12C returns Error 8 in this case,
			// so do we
			return null;
		}
	}

	return [last_coupon, next_coupon, coupons];
};

H.bond_price = function (desired_rate, coupon_year, buy, maturity)
{
	var price;
	var tot_interest;

	// * HP-12C only calculates semi-annual bonds i.e. bonds which pay coupons every 6 mo
	// * Value paid at maturity is always = 100

	var coupon_date = maturity;
	var tottime = H.date_diff(buy, maturity); 

	if (tottime <= 0) {
		return [H.ERROR_DATE, 0, 0];
	}

	var res = H.bond_previous_coupon(buy, maturity);

	if (res === null) {
		return [H.ERROR_DATE, 0, 0];
	}

	var E = H.date_diff(res[0], res[1]);
	var dsc = H.date_diff(buy, res[1]);	// time between settlement (buying) and next coupon
	var coupons = res[2];			// coupons that will be paid until maturity
	var dcs = E - dsc;			// time since last coupon, paid before we bought it.

	if (tottime <= E) {
		price = (100 * (100 + coupon_year / 2)) / (100 + ((tottime / E) * desired_rate / 2)); // present-value price
	} else {
		price = 100 / Math.pow(1 + desired_rate / 200, coupons - 1 + dsc / E); // present-value price
		for (var e = 1; e <= coupons; ++e) {
			// accumulate present value of all future coupons
			price += (coupon_year / 2) / Math.pow(1 + desired_rate / 200, e - 1 + dsc / E); 
		}
	}
	tot_interest = (coupon_year / 2) * dcs / E;
	price -= tot_interest; // coupon fraction compound before we bought it

	if (H.badnumber(price) || H.badnumber(tot_interest)) {
		return [H.ERROR_INTEREST, 0, 0];
	}

	return [-1, price, tot_interest];
};

H.irr_npvsum = function (n, cfj)
{
	var res = Math.abs(cfj[0]);
	for (var e = 1; e <= n; ++e) {
		res += Math.abs(cfj[e]);
	}
	return res;
};

H.irr_calc = function (n, i, cfj, nj)
{
	var firstNPV;
	var secondNPV;
	var interpolation_guess;
	var firstguess;
	var secondguess;
	var iteration = H.INTERPOLATION_MAX;

	var threshold = 0.000000000125;
	var threshold_order = H.irr_npvsum(n, cfj);

	if (threshold_order > 0) {
		threshold *= threshold_order;
	}

	if (i <= -100 || i > 10000000000) {
		i = 0;
	}

	firstguess = i + 1;
	secondguess = i;

	while (--iteration > 0) {
		i = firstguess;
		firstNPV = H.npv(n, i, cfj, nj);
		i = secondguess;
		secondNPV = H.npv(n, i, cfj, nj);

		if (i < -100 || i > 10000000000) {
			// pathological
			return [H.ERROR_IRR, i];
		}

		if (Math.abs(secondNPV) < threshold) {
			// we've made it
			return [-1, i];
		}

		var interpolation_B = (secondNPV - firstNPV) / (secondguess - firstguess); // B
		interpolation_guess = firstNPV - firstguess * interpolation_B; // A
		interpolation_guess /= -interpolation_B; // -A/B is the interpolation root
		interpolation_guess = H.solve_infinity(interpolation_guess);

		firstguess = secondguess;
		secondguess = interpolation_guess;
	}
	return [H.ERROR_IRR2, i];
};

H.financecalc = function (dependent, begin, compoundf, finarray)
{
	var err = 0;
	if (dependent === 0) {
		// n
		var tpmt = finarray[H.FIN_PMT];
		var tpvi = -finarray[H.FIN_PV] * finarray[H.FIN_I] / 100;
		var tfvi = finarray[H.FIN_FV] * finarray[H.FIN_I] / 100;
		var tfv = finarray[H.FIN_FV];
		if (tpmt < 0) {
			tpmt = -tpmt;
			tpvi = -tpvi;
			tfvi = -tfvi;
			tfv = -tfv;
		}
		
		err = err || finarray[H.FIN_I] <= -100; // i <= -100
		// "if" is kludge to work around a problem with PMT = 0 and FV != 0
		if (tfv === 0) {
			err = err || (tpmt <= tpvi); // PMT <= -VP x i
			err = err || H.feq10(tpmt, tpvi); // PMT <= -VP x i
		}
		// I am in doubt in relation to signal
		// err = err || H.feq10(tpmt, tfvi); // PMT == VF x i
	} else if (dependent == 2) {
		// PV
		err = err || finarray[H.FIN_I] <= -100; // i <= -100
	} else if (dependent == 3) { 
		// PMT
		err = err || finarray[H.FIN_I] <= -100; // i <= -100
		err = err || finarray[H.FIN_N] === 0; // n = 0
	} else if (dependent == 4) {
		// FV
		err = err || finarray[H.FIN_I] <= -100; // i <= -100
	}

	if (err) {
		return H.ERROR_INTEREST;
	}

	var firstNPV;
	var secondNPV;
	var interpolation_guess;
	var firstguess;
	var secondguess;
	var saved = finarray[dependent];
	var iteration = H.INTERPOLATION_MAX;
	var threshold = 0.000000000125;
	var threshold_order = 0;

	// correct threshold so it is more "lax" when involved numbers are too big
	if (dependent != H.FIN_PV) {
		threshold_order += Math.abs(finarray[H.FIN_PV]);
	}
	if (dependent != H.FIN_PMT) {
		threshold_order += Math.abs(finarray[H.FIN_PMT]);
	}
	if (dependent != H.FIN_N && dependent != H.FIN_PMT) {
		threshold_order += Math.abs(finarray[H.FIN_N] * finarray[H.FIN_PMT]);
	}
	if (dependent != H.FIN_FV) {
		threshold_order += Math.abs(finarray[H.FIN_FV]);
	}
	if (threshold_order > 0) {
		threshold *= threshold_order;
	}

	if (dependent == H.FIN_N || dependent == H.FIN_I || threshold_order <= 0) {
		secondguess = 1;
	} else {
		// initial guess for interpolation must be of same order as other parameters
		secondguess = threshold_order;
	}

	interpolation_guess = 0;

	while (--iteration >= 0) {
		firstguess = secondguess;
		secondguess = interpolation_guess;

		finarray[dependent] = firstguess;

		if (finarray[H.FIN_I] <= -100) {
			break;
		}

		firstNPV = H.calcNPV(dependent === 0,
				finarray[H.FIN_N], finarray[H.FIN_I], finarray[H.FIN_PV], 
				finarray[H.FIN_PMT], finarray[H.FIN_FV], begin, compoundf);


		finarray[dependent] = secondguess;

		if (finarray[H.FIN_I] <= -100) {
			break;
		}

		secondNPV = H.calcNPV(dependent === 0,
				finarray[H.FIN_N], finarray[H.FIN_I], finarray[H.FIN_PV], 
				finarray[H.FIN_PMT], finarray[H.FIN_FV], begin, compoundf);

		if (Math.abs(secondNPV) < threshold) {
			if (dependent === 0) {
				if ((secondguess - Math.floor(secondguess)) > 0.003) {
					finarray[dependent] = Math.floor(finarray[dependent]) + 1;
				} else {
					finarray[dependent] = Math.floor(finarray[dependent]);
				}
			}
			return -1;
		}

		var interpolation_B = (secondNPV - firstNPV) / (secondguess - firstguess); // B
		interpolation_guess = firstNPV - firstguess * interpolation_B; // A
		interpolation_guess /= -interpolation_B; // -A/B is the interpolation root
		interpolation_guess = H.solve_infinity(interpolation_guess);
	}

	// puts back the original value, since the calculated one may be NaN
	finarray[dependent] = saved;
	return H.ERROR_INTEREST;
};

H.bond_yield = function (coupon_year, buy, maturity, price)
{
	var desired_rate;

	if (buy === null) {
		return [H.ERROR_DATE, 0];
	}

	if (maturity === null) {
		return [H.ERROR_DATE, 0];
	}

	if (price <= 0) {
		return [H.ERROR_INTEREST, 0];
	}

	var firstNPV;
	var secondNPV;
	var interpolation_guess;
	var firstguess;
	var secondguess;
	var iteration = H.INTERPOLATION_MAX;

	var threshold = 0.000000000125 * Math.abs(price);

	firstguess = 0;
	secondguess = firstguess + 1;

	while (--iteration > 0) {
		var res = H.bond_price(firstguess, coupon_year, buy, maturity);
		if (! res) {
			return [H.ERROR_INTEREST, 0];
		} else if (res[0] >= 0) {
			return [res[0], 0];
		}
		firstNPV = res[1] - price;

		res = H.bond_price(secondguess, coupon_year, buy, maturity);
		if (! res) {
			return [H.ERROR_INTEREST, 0];
		} else if (res[0] >= 0) {
			return [res[0], 0];
		}
		secondNPV = res[1] - price;

		if (firstguess < -100 || firstguess > 10000000000) {
			// pathological
			return [H.ERROR_INTEREST, 0];
		}

		if (Math.abs(secondNPV) < threshold) {
			// we've made it
			desired_rate = secondguess;
			break;
		}

		var interpolation_B = (secondNPV - firstNPV) / (secondguess - firstguess); // B
		interpolation_guess = firstNPV - firstguess * interpolation_B; // A
		interpolation_guess /= -interpolation_B; // -A/B is the interpolation root
		interpolation_guess = H.solve_infinity(interpolation_guess);

		firstguess = secondguess;
		secondguess = interpolation_guess;
	}

	return [-1, desired_rate];
};

H.depreciation_sl = function (cost, sell, life, year)
{
	var depr = 0;
	var rest = cost - sell;

	if (year < 0 || year != Math.floor(year) || life <= 0 || life > Math.pow(10, 10)) {
		return [H.ERROR_INTEREST, 0, 0];
	}

	if (year > life) {
		// bail out early to avoid slowness if year is absurdly big
		// linear depreciation does not make sense if year > life
		return [-1, 0, 0];
	}

	while (--year >= 0) {
		depr = (cost - sell) / life;
		if (H.badnumber(depr)) {
			return [H.ERROR_DIVZERO, 0, 0];
		}
		rest -= depr;
	}

	return [-1, depr, rest];
};

H.depreciation_soyd = function (cost, sell, life, year)
{
	var depr = 0;
	var rest = cost - sell;

	if (year < 0 || year != Math.floor(year) || life <= 0 || life > Math.pow(10, 10)) {
		return [H.ERROR_INTEREST, 0, 0];
	}

	if (year > life) {
		// bail out early to avoid slowness if year is absurdly big
		// soyd depreciation does not make sense if year > life
		return [-1, 0, 0];
	}

	var year_up = 0;
	var soyd = life * (life + 1) / 2;

	while (--year >= 0) {
		depr = (cost - sell) * (life - (++year_up) + 1) / soyd;
		if (H.badnumber(depr)) {
			return [H.ERROR_DIVZERO, 0, 0];
		}
		rest -= depr;
	}

	return [-1, depr, rest];
};

H.depreciation_db = function (cost, sell, life, year, db)
{
	var depr = 0;
	var rest = cost - sell;

	if (year < 0 || year != Math.floor(year) || life <= 0 || life > Math.pow(10, 10)) {
		return [H.ERROR_INTEREST, 0, 0];
	}

	if (year > life || rest < 0) {
		// bail out early to avoid slowness if year is absurdly big
		// soyd depreciation does not make sense if year > life
		return [-1, 0, 0];
	}

	var birthday = 0;

	while (--year >= 0) {
		if (++birthday < life) {
			depr = (rest + sell) * db / life;
		} else {
			depr = rest;
		}
		if (H.badnumber(depr)) {
			return [H.ERROR_DIVZERO, 0, 0];
		}
		rest -= depr;

		if (rest < 0) {
			// may happen if db is big
			depr += rest;
			rest = 0;
		}
	}

	return [-1, depr, rest];
};

H.amortization = function (requested_n, orig_n, i, pv, pmt, decimals, begin)
{
	if (requested_n <= 0 || requested_n != Math.floor(requested_n) || i <= -1) {
		return [H.ERROR_INTEREST, 0, 0];
	}

	var tot_interest = 0;
	var tot_amort = 0;

	for (var e = 1; e <= requested_n; ++e) {
		var interest = H.cl5_round(-pv * i, decimals);
		if (e == 1 && begin && orig_n <= 0) {
			// front payment has no interest
			interest = 0;
		}
		var capital_amortization = pmt - interest;
		tot_interest += interest;
		tot_amort += capital_amortization;
		pv += capital_amortization;
	}

	return [-1, tot_interest, tot_amort];
};

H.degrees_to_radians = function (angle)
{
	return angle * Math.PI / 180;
};

H.radians = function (angle, mode) // 11C
{
	if (mode == H.TRIGO_DEG) {
		angle = H.degrees_to_radians(angle);
	} else if (mode == H.TRIGO_GRAD) {
		angle *= Math.PI / 200;
	}
	return angle;
};

H.radians_to_degrees = function (angle)
{
	return angle * 180 / Math.PI;
};

H.to_angle_mode = function (angle, mode) // 11C
{
	if (mode == H.TRIGO_DEG) {
		angle = H.radians_to_degrees(angle);
	} else if (mode == H.TRIGO_GRAD) {
		angle *= 200 / Math.PI;
	}
	return angle;
};

H.hour_to_hms = function (hour)
{
	var sgn = H.binary_sgn(hour);
	var whole_hour = Math.floor(Math.abs(hour));
	var fraction = Math.abs(hour) - whole_hour;
	fraction *= 60;
	// avoid leaving a 0.999... fraction behind
	var minutes = Math.floor(fraction + 0.00000001);
	// make sure it does not get negative
	fraction = Math.max(fraction - minutes, 0);
	var seconds = fraction * 60;
	return sgn * (whole_hour + minutes / 100 + seconds / 10000);
};

H.hms_to_hour = function (hour)
{
	var sgn = H.binary_sgn(hour);
	var whole_hour = Math.floor(Math.abs(hour));
	var fraction = Math.abs(hour) - whole_hour;
	fraction *= 100;
	// avoid leaving a 0.999... fraction behind
	var minutes = Math.floor(fraction + 0.0000001);
	// make sure it does not get negative
	fraction = Math.max(fraction - minutes, 0);
	var seconds = fraction * 100;
	return sgn * (whole_hour + minutes / 60 + seconds / 3600);
};

// hyperbolic functions from http://phpjs.org/functions/

H.asinh = function (arg) {
	return Math.log(arg + Math.sqrt(arg * arg + 1));
};

H.acosh = function (arg) {
	return Math.log(arg + Math.sqrt(arg * arg - 1));
};

H.atanh = function (arg) {
	return 0.5 * Math.log((1 + arg) / (1 - arg));
};

H.sinh = function (arg) {
	return (Math.exp(arg) - Math.exp(-arg)) / 2;
};

H.cosh = function (arg) {
	return (Math.exp(arg) + Math.exp(-arg)) / 2;
};

H.tanh = function (arg) {
	return (Math.exp(arg) - Math.exp(-arg)) / (Math.exp(arg) + Math.exp(-arg));
};

H.feq = function (a, b, epsilon) {
	if (a === undefined || a === null || b === undefined || b === null ||
					H.badnumber(a) || H.badnumber(b)) {
		console.log("feq: bad number");
		return false;
	}

	if (epsilon === undefined || epsilon === null) {
		epsilon = Math.pow(10, -10);
	}

	/*
	// convert numbers into intervals
	var A = a - epsilon;
	var B = a + epsilon;
	var X = b - epsilon;
	var Y = b + epsilon;

	// interval equality
	// return B >= X && A <= Y;
	// if numbers are negative, (A,B) (X,Y) will not be in order!
	return (A >= X && A <= Y) || (B >= X && B <= Y);
	*/

	// print(" " + a + " " + b + " " + epsilon + " " + Math.abs(a - b) +
	// (Math.abs(a - b) < epsilon));

	return Math.abs(a - b) <= epsilon;
};

H.arithmetic_round = function (r, a, b)
{
	if (r === 0) {
		// nothing to round
		return r;
	} else if (a === 0 && b === 0) {
		// both zeros or no rounding desired (mult, div, power)
		return r;
	}

	var r_order = Math.floor(Math.log(Math.abs(r)) / Math.log(10));
	var order = r_order;

	if (a !== 0) {
		order = Math.floor(Math.log(Math.abs(a)) / Math.log(10));
	}
	if (b !== 0) {
		order = Math.min(order, Math.floor(Math.log(Math.abs(a)) / Math.log(10)));
	}
	if (order < -88) {
		// too small, let it go
		return r;
	}

	var scale = Math.pow(10, 11 - order);
	var r2 = Math.round(Math.abs(r) * scale) / scale * H.binary_sgn(r);
	// console.log("" + r + " " + r2);
	return r2;
};

H.feq10 = function (a, b) {
	if (a === undefined || a === null || b === undefined || b === null ||
					H.badnumber(a) || H.badnumber(b)) {
		return false;
	}

	var epsilon = 0; // exact comparison

	if (a === 0 || b === 0) {
		// comparison with pure zero is special case
		epsilon = Math.pow(10, -100);
	} else {
		var order = Math.floor(Math.max(Math.log(Math.abs(b)) / Math.log(10),
				       Math.log(Math.abs(a)) / Math.log(10))) + 1;

		if (H.badnumber(order)) {
			// either a or b tend to zero
			epsilon = Math.pow(10, -100);
		} else {
			epsilon = Math.pow(10, order - 10);
		}
	}

	return H.feq(a, b, epsilon);
};

// comparision with 10^-10 tolerance when one of the values tend to zero
H.feq10_0 = function (a, b)
{
	var offset = 0;
	if ((a <= 1 && a >= -1) || (b <= 1 && b >= -1)) {
		offset = 2;
	}
	return H.feq10(offset + a, offset + b);
};

H.polar = function (x, y) {
	var angle = Math.atan2(y, x);
	var r = Math.sqrt(x * x + y * y);
	return [r, angle];
};

H.orthogonal = function (r, angle)
{
	return [r * Math.cos(angle), r * Math.sin(angle)];
};

H.fatorial = function (n)
{
	var res = 1;
	while (n > 1 && ! H.badnumber(res)) {
		res *= n;
		--n;
	}
	return res;
};

// from Wikipedia
H.gamma = function (z) {
	if (z < 0.5) {
		return Math.PI / (Math.sin(Math.PI * z) * H.gamma(1 - z));
	}
	z = z - 1;
	var x = H.gamma.p[0];
	for (var i = 1; i < (H.gamma.g + 2); ++i) {
		x += H.gamma.p[i] / (z + i);
	}
	var t = z + H.gamma.g + 0.5;
	return Math.sqrt(2 * Math.PI) * Math.pow(t, (z + 0.5)) * Math.exp(-t) * x;
};

H.gamma.g = 7;
H.gamma.p = [0.99999999999980993, 676.5203681218851,
	-1259.1392167224028, 771.32342877765313, -176.61502916214059,
	12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
	1.5056327351493116e-7];

H.fatorial_gamma = function (n)
{
	if (n >= 0 && Math.floor(n) == n) {
		return H.fatorial(n);
	}
	return H.gamma(n + 1);
};

H.permutations = function (a, b)
{
	return H.fatorial(a) / H.fatorial(a - b);
};

H.combinations = function (a, b)
{
	return H.permutations(a, b) / H.fatorial(b);
};

H.stddev = function (mem)
{
	if (mem[H.STAT_N] <= 1 || 
	    (mem[H.STAT_N] * mem[H.STAT_X2] - mem[H.STAT_X] * mem[H.STAT_X]) < 0 ||
	    (mem[H.STAT_N] * mem[H.STAT_Y2] - mem[H.STAT_Y] * mem[H.STAT_Y]) < 0) {
		return [0];
	}
	var x = Math.pow((mem[H.STAT_N] * mem[H.STAT_X2] - mem[H.STAT_X] * mem[H.STAT_X]) /
			 (mem[H.STAT_N] * (mem[H.STAT_N] - 1)), 0.5);
	var y = Math.pow((mem[H.STAT_N] * mem[H.STAT_Y2] - mem[H.STAT_Y] * mem[H.STAT_Y]) /
			 (mem[H.STAT_N] * (mem[H.STAT_N] - 1)), 0.5);
	return [1, x, y];
};

H.linear_regression = function (mem)
{
	if (mem[H.STAT_N] <= 1) {
		console.log("LR err type 1");
		return [0];
	}

	if (mem[H.STAT_N] <= 1) {
		console.log("LR err type 2");
		return [0];
	}

	if (H.feq(mem[H.STAT_X2] - mem[H.STAT_X] * mem[H.STAT_X] / mem[H.STAT_N], 0)) {
		console.log("LR err type 3");
		return [0];
	}

	// TODO implement test [ n Ex2 - (Ex)2] [ n Ey2 - (Ey)2] <= 0

	var avgx = mem[H.STAT_X] / mem[H.STAT_N];
	var avgy = mem[H.STAT_Y] / mem[H.STAT_N];

	var B = mem[H.STAT_XY] - mem[H.STAT_X] * mem[H.STAT_Y] / mem[H.STAT_N];
	B /= mem[H.STAT_X2] - mem[H.STAT_X] * mem[H.STAT_X] / mem[H.STAT_N];

	if (H.badnumber(B)) {
		console.log("LR err type 4");
		return [0];
	}

	var A = avgy - B * avgx;

	// note: vars are following the HP12C handbook convention
	// y=Bx+A, while the 11C and math convention is y=Ax+B.

	return [1, A, B];
};

H.stat_kr = function (mem, is_x, xx)
{
	var res = H.linear_regression(mem);

	if (! res[0]) {
		console.log("statkr error 1");
		return [0];
	}

	var A = res[1];
	var B = res[2];

	// note: vars are following the HP12C handbook convention
	// y=Bx+A, while the 11C and math convention is y=Ax+B.

	if (is_x) {
		if (H.feq((mem[H.STAT_N] * mem[H.STAT_X2] - mem[H.STAT_X] * mem[H.STAT_X]), 0)) {
			console.log("statkr error 2");
			return [0];
		}
	} else {
		if (H.feq((mem[H.STAT_N] * mem[H.STAT_Y2] - mem[H.STAT_Y] * mem[H.STAT_Y]), 0)) {
			console.log("statkr error 3");
			return [0];
		}
	}

	var rr1 = mem[H.STAT_XY] - mem[H.STAT_X] * mem[H.STAT_Y] / mem[H.STAT_N];
	var rr2 = mem[H.STAT_X2] - mem[H.STAT_X] * mem[H.STAT_X] / mem[H.STAT_N];
	var rr3 = mem[H.STAT_Y2] - mem[H.STAT_Y] * mem[H.STAT_Y] / mem[H.STAT_N];

	if (rr2 === 0 || rr3 === 0) {
		console.log("statkr error 5");
		return [0];
	}

	if ((rr2 * rr3) < 0) {
		console.log("statkr error 6");
		return [0];
	}

	var rr = Math.sqrt(rr2 * rr3);

	if (H.badnumber(rr) || rr < 0) {
		console.log("statkr error 6");
		return [0];
	}

	var r = rr1 / rr;

	var c;

	if (is_x) {
		if (B === 0) {
			console.log("statkr error 7");
			return [0];
		}
		c = (xx - A) / B;
	} else {
		c = A + B * xx;
	}

	if (H.badnumber(c)) {
		console.log("statkr error 8");
		return [0];
	}

	return [1, c, r];
};

H.stat_accumulate = function (sgn, mem, x, y)
{
	mem[H.STAT_N] += sgn;
	mem[H.STAT_X] += sgn * x;
	mem[H.STAT_X2] += sgn * x * x;
	mem[H.STAT_Y] += sgn * y;
	mem[H.STAT_Y2] += sgn * y * y;
	mem[H.STAT_XY] += sgn * x * y;
};

H.stat_avg = function (mem)
{
	if (mem[H.STAT_N] === 0) {
		return [0];
	}
	var x = mem[H.STAT_X] / mem[H.STAT_N];
	var y = mem[H.STAT_Y] / mem[H.STAT_N];
	return [1, x, y];
};

H.stat_avgw = function (mem)
{
	if (mem[H.STAT_X] === 0) {
		return [0];
	}
	return [1, mem[H.STAT_XY] / mem[H.STAT_X]];
};
H.sve = 7.5;
H.kve = "eeae9d29025fb3573c0b2eeb7c75114a";
/*jslint white: true, undef: true, nomen: true, regexp: true, strict: true, browser: true, bitwise: true */

/*global H */

// TODO unit test with key sequences etc.

"use strict";

function Hp12c_pgrm()
{
	this.exec_special = [];
	this.exec_special[H.GTO] = [3, 1, this.p_exec_gto];
	this.exec_special[H.dispatcher.KEY_RS] = [1, 0, this.p_exec_rs];

	this.type_special = [];
	var t = this.type_special;

	t[H.FF * 100 + H.dispatcher.KEY_RS] = this.p_type_pr;
	t[H.dispatcher.KEY_SST] = this.p_type_sst;
	t[H.GG * 100 + H.dispatcher.KEY_SST] = this.p_type_bst;
	t[H.dispatcher.KEY_BACKSPACE] = this.p_type_bst;
	t[H.FF * 100 + H.dispatcher.KEY_RDOWN] = this.p_type_clear_pgrm;
	t[H.GTO * 100 + H.dispatcher.KEY_DECIMAL] = this.p_type_gto_move_begin;
	t[H.GG * 100 + H.dispatcher.KEY_RDOWN] = this.p_type_gto_begin;
	t[H.GG * 100 + 9] = this.p_type_mem_info;

	for (var n = 0; n <= 9; ++n) {
		t[H.GTO_MOVE * 100 + n] = this.p_type_gto_move_n;
		t[H.GTO * 100 + n] = this.p_type_gto_n;
	}

	this.execution_delay = 100;
}

Hp12c_pgrm.p_encode_key = function (key, addr)
{
	var opcode;

	if (addr) {
		opcode = H.zeropad(key.toFixed(0), H.ram_ADDR_SIZE);
	} else {
		opcode = H.zeropad(key.toFixed(0), H.INSTRUCTION_SIZE);
	}

	return opcode;
};

Hp12c_pgrm.p_expand_opcode = function (modifier)
{
	var a = [];

	// Expands an opcode or modifier codified like 100 * op0 + op1
	if (modifier >= H.INSTRUCTION_MAX) {
		// composite modifier; recurse
		a = Hp12c_pgrm.p_expand_opcode(Math.floor(modifier / 100));
	}
	a.push(modifier % H.INSTRUCTION_MAX);
	return a;
};

Hp12c_pgrm.p_encode_modifier = function (modifier)
{
	if (modifier <= 0) {
		return "";
	}

	var opcode = "";
	var expanded = Hp12c_pgrm.p_expand_opcode(modifier);

	for (var i = 0; i < expanded.length; ++i) {
		opcode += Hp12c_pgrm.p_encode_key(expanded[i], 0) + ".";
	}

	return opcode;
};

Hp12c_pgrm.p_encode_instruction = function (modifier, key, addr)
{
	return Hp12c_pgrm.p_encode_modifier(modifier) +
	       Hp12c_pgrm.p_encode_key(key, addr);

};

Hp12c_pgrm.prototype.p_poke = function (modifier, key, addr)
{
	if ((H.machine.ip + 1) >= H.ram_MAX) {
		H.machine.display_error(H.ERROR_IP);
		return;
	}
	++H.machine.ip;

	// The HP-12C *replaces* instructions on edit, does not insert them!
	//
	// for (var e = H.ram_MAX - 1; e > H.machine.ip; --e) {
	//	ram[e] = ram[e-1];
	// }

	H.machine.ram[H.machine.ip] =
		Hp12c_pgrm.p_encode_instruction(modifier, key, addr);
};

Hp12c_pgrm.prototype.p_sched = function ()
{
	if (H.machine.program_mode >= H.RUNNING) {
		H.machine.display_pgrm();
		var a = this;
		window.setTimeout(function () {
			a.p_execute();
		}, this.execution_delay);
	}
};

Hp12c_pgrm.prototype.p_exec_gto = function (op)
{
	// handled in special way because it changes IP
	H.machine.ip = op[2];
	H.machine.rst_modifier(1);
};

Hp12c_pgrm.prototype.p_exec_rs = function (op)
{
	++H.machine.ip;
	this.stop();
	H.machine.rst_modifier(1);
};

Hp12c_pgrm.p_opcode_match = function (candidate, model, comparison_len)
{
	model = Hp12c_pgrm.p_expand_opcode(model);

	for (var i = 0; i < comparison_len; ++i) {
		if (candidate[i] != model[i]) {
			return false;
		}
	}

	return true;
};

Hp12c_pgrm.prototype.p_exec_handle_special = function (op)
{
	var handler = null;

	for (var prefix in this.exec_special) {
		if (typeof prefix !== "object") {
			var expected_len = this.exec_special[prefix][0];
			var suffix_len = this.exec_special[prefix][1];
			var f = this.exec_special[prefix][2];

			if (expected_len != op.length) {
				continue;
			}

			if (! Hp12c_pgrm.p_opcode_match(op, prefix, 
					expected_len - suffix_len)) {
				continue;
			}

			handler = f;
			break;
		}
	}
	
	if (handler) {
		handler.call(this, op);
	}

	return !!handler;
};

Hp12c_pgrm.prototype.p_execute = function ()
{
	if (H.machine.program_mode < H.RUNNING) {
		return;
	}

	if (! H.keyboard.enabled()) { // we are inside a pause; resched to later
		this.p_sched();
		return;
	}

	if (H.machine.ip <= 0) {
		H.machine.ip = 1;
		H.machine.display_pgrm();
	}

	var op_txt = H.machine.ram[H.machine.ip];
	var op = op_txt.split(".");

	// window.console.log("Executing " + op_txt);

	var e;

	for (e = 0; e < op.length; ++e) {
		op[e] = parseInt(op[e], 10);
	}

	if (! this.p_exec_handle_special(op)) {
		// not special; execute via dispatcher

		for (e = 0; e < op.length; ++e) {
			if (!H.dispatcher.dispatch_common(op[e])) {
				window.console.log("Invalid opcode for exec: " + op_txt);
			}
		}

		if (H.machine.program_mode >= H.RUNNING || ! H.machine.error_in_display) {
			// sticks at error opcode
			++H.machine.ip;
		}
	}

	// instruction execution aftermath

	if (H.machine.ip > (H.ram_MAX - 1)) {
		// top of RAM
		H.machine.ip = 0;
	}

	if (H.machine.ip <= 0) {
		// GTO 00 or equivalent
		this.stop();
	} else if (H.machine.program_mode == H.RUNNING_STEP) {
		H.machine.program_mode = H.INTERACTIVE;
		H.machine.display_pgrm();
	} else if (H.machine.program_mode == H.RUNNING) {
		this.p_sched();
	}	
};

Hp12c_pgrm.prototype.p_run_step = function ()
{
	H.machine.program_mode = H.RUNNING_STEP;
	if (H.machine.ip <= 0) {
		H.machine.ip = 1;
	}
	H.machine.display_pgrm();
	this.p_sched();
};

Hp12c_pgrm.prototype.p_run = function ()
{
	H.machine.program_mode = H.RUNNING;
	if (H.machine.ip <= 0) {
		H.machine.ip = 1;
	}
	H.machine.display_pgrm();
	this.p_sched();
};

Hp12c_pgrm.prototype.rs = function ()
{
	if (H.machine.program_mode == H.INTERACTIVE) {
		H.machine.display_result();
		this.p_run();
	} else {
		this.stop();
	}
	H.machine.rst_modifier(1);
};

Hp12c_pgrm.prototype.p_type_pr = function (key)
{
	// f + P/R exits programming mode
	H.machine.rst_modifier(1);
	H.machine.program_mode = H.INTERACTIVE;
	H.machine.ip = 0;
	H.machine.display_pgrm();
	H.machine.display_modifier();
	H.machine.display_result();
};

Hp12c_pgrm.prototype.p_type_mem_info = function (key)
{
	H.machine.rst_modifier(1);
	H.machine.mem_info();
};

Hp12c_pgrm.prototype.p_type_sst = function (key)
{
	if (++H.machine.ip >= H.ram_MAX) {
		H.machine.ip = 0;
	}
	H.machine.rst_modifier(1);
	H.machine.display_program_opcode();
};

Hp12c_pgrm.prototype.p_type_bst = function (key)
{
	if (--H.machine.ip < 0) {
		H.machine.ip = H.ram_MAX - 1;
	}
	H.machine.rst_modifier(1);
	H.machine.display_program_opcode();
};

Hp12c_pgrm.prototype.p_type_clear_pgrm = function (key)
{
	H.machine.clear_prog(1);
	H.machine.rst_modifier(1);
	H.machine.display_program_opcode();
};

Hp12c_pgrm.prototype.p_type_gto_move_n = function (key)
{
	H.machine.gtoxx = "" + H.machine.gtoxx + key.toFixed(0);
	if (H.machine.gtoxx.length >= H.ram_ADDR_SIZE) {
		var ip = parseInt(H.machine.gtoxx, 10);
		H.machine.gtoxx = "";
		H.machine.rst_modifier(1);
		if (ip >= H.ram_MAX) {
			H.machine.display_error(H.ERROR_IP);
			return;
		}
		H.machine.ip = ip;
	}
	H.machine.display_program_opcode();
};

Hp12c_pgrm.prototype.p_type_gto_n = function (key)
{
	H.machine.gtoxx = "" + H.machine.gtoxx + key.toFixed(0);
	if (H.machine.gtoxx.length >= H.ram_ADDR_SIZE) {
		var ip = parseInt(H.machine.gtoxx, 10);
		H.machine.gtoxx = "";
		H.machine.rst_modifier(1);
		if (ip >= H.ram_MAX) {
			H.machine.display_error(H.ERROR_IP);
			return;
		}
		this.p_poke(H.GTO, ip, 1);
	}
	H.machine.display_program_opcode();
};

Hp12c_pgrm.prototype.p_type_gto_move_begin = function (key)
{
	H.machine.set_modifier(H.GTO_MOVE, 1);
	H.machine.display_program_opcode();
};

Hp12c_pgrm.prototype.p_type_gto_begin = function (key)
{
	H.machine.set_modifier(H.GTO, 1);
	H.machine.gtoxx = "";
	H.machine.display_program_opcode();
	return true;
};

Hp12c_pgrm.prototype.p_type_handle_special = function (key)
{
	var handler = null;
	var op = H.machine.modifier * 100 + key;

	if (this.type_special[op]) {
		this.type_special[op].call(this, key);
		return true;
	}

	return false;
};


Hp12c_pgrm.prototype.type = function (key)
{
	if (this.p_type_handle_special(key)) {
		return;
	}

	// non-special key; resolve using dispatcher mechanism

	if (! H.dispatcher.handle_modifier(key, 1)) {
		// note that find_function may reset the modifier
		var f = H.dispatcher.find_function(key, 1);
		if (! f) {
			window.console.log("pgrm typing: no handler for " + key);
			H.machine.display_program_opcode();
			H.machine.rst_modifier(1);
			return;
		}
		this.p_poke(H.machine.modifier, key, 0);
		H.machine.rst_modifier(1);
	}

	H.machine.display_program_opcode();
};

//////////// functions called from interactive mode only

Hp12c_pgrm.prototype.stop = function ()
{
	H.machine.program_mode = H.INTERACTIVE;
	H.machine.display_pgrm();
	if (! H.machine.error_in_display) {
		H.machine.display_result();
	}
};

Hp12c_pgrm.prototype.sst = function ()
{
	if (H.machine.program_mode == H.INTERACTIVE) {
		this.p_run_step();
	}
	H.machine.rst_modifier(1);
};

Hp12c_pgrm.prototype.bst = function ()
{
	if (H.machine.ip > 0) {
		--H.machine.ip;
	}
	H.machine.display_program_opcode();
	H.machine.cli();

	window.setTimeout(function () {
		H.machine.prog_bst_after();
	}, this.execution_delay);
	H.machine.rst_modifier(1);
};
/* HP-12C emulator 
 * Copyright (c) 2011 EPx.com.br.
 * All rights reserved.
 */

/*jslint white: true, undef: true, nomen: true, regexp: true, strict: true, browser: true, bitwise: true */
/*global H */

"use strict";

function Hp12c_storage()
{
}

Hp12c_storage.prototype.instruction_table = "0123456789_-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
Hp12c_storage.prototype.addr_prefix = "$";

Hp12c_storage.prototype.compress_opcode = function (op)
{
	var c_op = "";
	var opcodelist = op.split('.');
	for (var e = 0; e < opcodelist.length; ++e) {
		var opcode = opcodelist[e];
		var lopcode = opcode.length;
		var nopcode = parseInt(opcode, 10);
		if (lopcode == H.INSTRUCTION_SIZE && nopcode >= 0 && nopcode <= 50) {
			c_op += this.instruction_table.charAt(nopcode);
		} else if (lopcode == H.ram_ADDR_SIZE) {
			c_op += this.addr_prefix; 
			if (nopcode < 64) {
				c_op += this.instruction_table.charAt(nopcode);
			} else {
				c_op += this.instruction_table.charAt(Math.floor(nopcode / 64));
				c_op += this.instruction_table.charAt(nopcode % 64);
			}
		} else {
			// invalid instruction
			return this.compress_opcode(H.STOP_INSTRUCTION);
		}
	}
	return c_op;
};

Hp12c_storage.prototype.decompress_opcode = function (c_op)
{
	var op = "";
	var aop = [];
	var cc;
	var ncc;
	var err = 0;
	var addr_mode = 0;
	var addr_value = 0;

	for (var e = 0; e < c_op.length; ++e) {
		cc = c_op.charAt(e);
		if (cc == this.addr_prefix) {
			if ((aop.length < 1) || (addr_mode > 0)) {
				err = 1;
				break;
			}
			addr_mode = 1;
			continue;
		}
		ncc = this.instruction_table.indexOf(cc);
		if (ncc < 0) {
			err = 1;
			break;
		}
		if (addr_mode) {
			addr_value = (addr_value * 64) + ncc;
			if (addr_value >= Math.pow(10, H.ram_ADDR_SIZE)) {
				err = 1;
				break;
			}
			if (addr_value >= H.ram_MAX) {
				err = 1;
				break;
			}
			if (addr_mode == 1) {
				aop.push(H.zeropad(addr_value, H.ram_ADDR_SIZE));
			} else {
				aop[aop.length - 1] = H.zeropad(addr_value, H.ram_ADDR_SIZE);
			}
			addr_mode += 1;
		} else {
			if (ncc > 49) {
				err = 1;
				break;
			}
			aop.push(H.zeropad(ncc, H.INSTRUCTION_SIZE));
		}
	}

	if (err) {
		op = H.STOP_INSTRUCTION;
	} else if (aop.length > 3 || aop.length < 1) { 
		op = H.STOP_INSTRUCTION;
	} else {
		op = aop.join('.');
		/*
		// protection against "old" 12c memory being loaded on 11c
		if (op == "43.33.000" && H.STOP_INSTRUCTION != op) {
			op = H.STOP_INSTRUCTION;
		}
		if (op == "43.33.00" && H.STOP_INSTRUCTION != op) {
			op = H.STOP_INSTRUCTION;
		}
		*/
	}

	return op;
};

Hp12c_storage.prototype.marshal_array = function (a, type)
{
	var mtxt = "A" + type;

	for (var ex = 0; ex < a.length; ++ex) {
		var data = a[ex];
		if (type == 'X') {
			data = this.compress_opcode(data);
		}
		mtxt += "!" + data;
	}

	return mtxt;
};

Hp12c_storage.prototype.unmarshal_array = function (target, dst_name, mtxt)
{
	if (mtxt.length < 2) {
		// can't be an encoded array, since it needs at least 'A' + type character
		return;
	}

	var dst = target[dst_name]; // must be already filled with 0s or anything
	var type = mtxt.charAt(1);
	mtxt = mtxt.slice(3);
	var a = mtxt.split('!');

	for (var ex = 0; ex < a.length && ex < dst.length; ++ex) {
		if (type == 'N') {
			dst[ex] = parseFloat(a[ex]);
			if (H.badnumber(dst[ex])) {
				dst[ex] = 0;
			}
		} else {
			// programming opcode
			if (ex > 0) {
				dst[ex] = this.decompress_opcode(a[ex]);
			}
		}
	}

	return;
};

Hp12c_storage.prototype.save_memory2 = function (target)
{
	var expires = new Date();
	expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // timezone irrelevant
	var sm = target.nvname + "=";
	var i, k;

	for (i = 0; i < target.nvN.length; ++i) {
		k = target.nvN[i];
		sm += k + ":" + target[k] + " ";
	}

	for (i = 0; i < target.nvAN.length; ++i) {
		k = target.nvAN[i];
		sm += k + ":" + this.marshal_array(target[k], 'N') + " ";
	}

	for (i = 0; i < target.nvAX.length; ++i) {
		k = target.nvAX[i];
		sm += k + ":" + this.marshal_array(target[k], 'X') + " ";
	}

	sm += "; expires=" + expires.toGMTString() + "; path=/";

	return sm;
};

Hp12c_storage.prototype.save = function ()
{
	// WARNING this method is overridden by widgets!
	document.cookie = this.save_memory2(H.machine);
};

Hp12c_storage.prototype.get_memory = function ()
{
	return this.save_memory2(H.machine);
};

Hp12c_storage.prototype.recover_memory2 = function (target, sserial)
{
	var ck = sserial.split(';'); // gets all cookie variables for this site

	for (var f = 0; f < ck.length; ++f) {
		var cv = ck[f].split('=');      // split cookie variable name and value
		if (cv.length != 2) {
			continue;
		}
		cv[0] = H.trim(cv[0]);
		cv[1] = H.trim(cv[1]);
		if (cv[0] != H.type_cookie) {
			continue;
		}
		var sm = cv[1].split(' '); 	// internal variable separation
		for (var e = 0; e < sm.length; ++e) {
			var smpair = sm[e].split(':');  // each internal variable is name=value

			if (smpair.length == 2 && target[smpair[0]] !== undefined) {
				if (smpair[1].length >= 2 && smpair[1].charAt(0) == 'A') {
					this.unmarshal_array(target, smpair[0], smpair[1]);
				} else {
					target[smpair[0]] = parseFloat(smpair[1]);
					if (H.badnumber(target[smpair[0]])) {
						target[smpair[0]] = 0;
					}
				}
			}
		}
	}

	if (H.type != "11c") {
		return;
	}

	// calculate program_size
	H.machine.program_size = 1;
	for (e = 1; e < H.ram_MAX; ++e) {
		if (H.machine.ram[e] != H.STOP_INSTRUCTION) {
			H.machine.program_size += 1;
		} else {
			break;
		}
	}
};

Hp12c_storage.prototype.load = function ()
{
	// gets all cookie variables for this site
	// WARNING this method is overridden by widgets!
	this.recover_memory2(H.machine, document.cookie);
};

Hp12c_storage.prototype.set_memory = function (txt)
{
	this.recover_memory2(H.machine, txt);
};
/* HP-12C emulator 
 * Copyright (c) 2011 EPx.com.br.
 * All rights reserved.
 */

/*jslint white: true, undef: true, nomen: true, regexp: true, strict: true, browser: true, bitwise: true */
/*global H, Hp12c_display, Hp12c_keyboard, Hp12c_debug, Hp12c_machine, Hp12c_storage, Hp12c_dispatcher, Hp12c_pgrm */

"use strict";

function Close_hp12c()
{
	if (! Close_hp12c.done) {
		H.storage.save();
		Close_hp12c.done = 1;
	}
}
Close_hp12c.done = 0;

function Init_hp12c()
{
	H.display = new Hp12c_display();
	H.keyboard = new Hp12c_keyboard();
	H.debug = new Hp12c_debug(H.display.format_result);
	H.machine = new Hp12c_machine();
	H.dispatcher = new Hp12c_dispatcher();
	H.pgrm = new Hp12c_pgrm();
	H.storage = new Hp12c_storage();

	H.machine.init();
	H.storage.load();
	H.machine.display_all();
	H.machine.sti();

	window.onunload = Close_hp12c;
	window.beforenunload = Close_hp12c;
	document.onunload = Close_hp12c;
	document.beforeunload = Close_hp12c;
}
H.touch_display = true;
