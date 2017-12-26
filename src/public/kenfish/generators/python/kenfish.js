'use strict';
//goog.provide('Blockly.Arduino.Kenblcok');
//goog.require('Blockly.Arduino');

goog.provide('Blockly.Python.Kenblcok');

goog.require('Blockly.Python');

Blockly.Python['kenfish_repeat_ext'] = function(block) {
	// Repeat n times.
	if (block.getField('TIMES')) {
		// Internal number.
		var repeats = String(Number(block.getFieldValue('TIMES')));
	} else {
		// External number.
		var repeats = Blockly.Python.valueToCode(block, 'TIMES',
			Blockly.Python.ORDER_ASSIGNMENT) || '0';
	}
	var branch = Blockly.Python.statementToCode(block, 'DO');
	branch = Blockly.Python.addLoopTrap(branch, block.id);
	var code = '';
	var loopVar = Blockly.Python.variableDB_.getDistinctName(
		'count', Blockly.Variables.NAME_TYPE);
	var endVar = repeats;
	if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
		var endVar = Blockly.Python.variableDB_.getDistinctName(
			'repeat_end', Blockly.Variables.NAME_TYPE);
		code += 'var ' + endVar + ' = ' + repeats + ';\n';
	}
	code += '{"type":3,"id":64,"c":"logic_repeat","times":' + endVar + ', "contents":[\n' +
		branch + ' {"type":3,"id":64,"c":"logic_end"}\n]},\n';
	return code;
};

Blockly.Python['kenfish_loop'] = function(block) {
	// Repeat n times.
	if (block.getField('TIMES')) {
		// Internal number.
		var repeats = String(Number(block.getFieldValue('TIMES')));
	} else {
		// External number.
		var repeats = Blockly.Python.valueToCode(block, 'TIMES',
			Blockly.Python.ORDER_ASSIGNMENT) || '0';
	}
	var branch = Blockly.Python.statementToCode(block, 'DO');
	branch = Blockly.Python.addLoopTrap(branch, block.id);
	var code = '';
	var loopVar = Blockly.Python.variableDB_.getDistinctName(
		'count', Blockly.Variables.NAME_TYPE);
	var endVar = repeats;
	if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
		var endVar = Blockly.Python.variableDB_.getDistinctName(
			'repeat_end', Blockly.Variables.NAME_TYPE);
		code += 'var ' + endVar + ' = ' + repeats + ';\n';
	}
	code += '{"type":3,"id":64,"c":"logic_loop"' + ', "contents":[\n' +
		branch + ' {"type":3,"id":64,"c":"logic_end"}\n]},\n';
	return code;
};

Blockly.Python['kenfish_head'] = function(block) {
	var dropdown_lmst_action;
	var dropdown_lmst_gear = this.getFieldValue('lmst_lamp');
	// TODO: Assemble Python into code variable.
	//Blockly.Arduino.definitions_['YJ_LmstSystemInit'] = '#include <LMST_ArduinoInterface.h>';
	//Blockly.Arduino.setups_['YJ_LmstSystemInit'] = 'YJ_LmstSystemInit();\n delay(2000);';
	if (dropdown_lmst_gear == 1) {
		dropdown_lmst_action = 6;
		var code = 'Lmst.OpenHeadLight()\n';
	} else {
		dropdown_lmst_action = 7;
		var code = 'Lmst.CloseHeadLight()\n';
	}


	return code;
};

Blockly.Python['SASK_led'] = function(block) {
	var dropdown_lmst_action;
	var dropdown_lmst_gear = this.getFieldValue('lmst_SASK_led');
	// TODO: Assemble Python into code variable.
	//Blockly.Arduino.definitions_['YJ_LmstSystemInit'] = '#include <LMST_ArduinoInterface.h>';
	//Blockly.Arduino.setups_['YJ_LmstSystemInit'] = 'YJ_LmstSystemInit();\n delay(2000);';
	if (dropdown_lmst_gear == 1) {
		dropdown_lmst_action = 6;
		var code = 'lzai.SaksLedOn()\n';
	} else {
		dropdown_lmst_action = 7;
		var code = 'lzai.SaksLedOff()\n';
	}

	return code;
};

Blockly.Python['kenfish_ctrl'] = function(block) {
	// Numeric value.
	//var code = parseFloat(block.getFieldValue('NUM')) ;
	var dropdown_lmst_action = this.getFieldValue('lmst_action');
	var dropdown_lmst_gear = this.getFieldValue('lmst_gear');
	Blockly.Python.controls_repeat_ext(block);
	// TODO: Assemble Python into code variable.
	Blockly.Python.definitions_['YJ_LmstSystemInit'] = '#include <LMST_ArduinoInterface.h>';
	//Blockly.Python.setups_['YJ_LmstSystemInit'] = 'YJ_LmstSystemInit();\n delay(2000);';
	var code = 'YJ_LmstCtrl(' + dropdown_lmst_action + ',' + dropdown_lmst_gear + ');\n';

	return code;
};

//Blockly.Arduino.kenfish_ctrl = function() {
//		var dropdown_lmst_action =this.getFieldValue('lmst_action');
//		var dropdown_lmst_gear   =this.getFieldValue('lmst_gear');
//	  // TODO: Assemble Python into code variable.
//		Blockly.Arduino.definitions_['YJ_LmstSystemInit'] = '#include <LMST_ArduinoInterface.h>';
//		Blockly.Arduino.setups_['YJ_LmstSystemInit'] = 'YJ_LmstSystemInit();\n delay(2000);';
//		var code ='YJ_LmstCtrl('+ dropdown_lmst_action + ',' + dropdown_lmst_gear + ');\n';
//		return code;
//};

Blockly.Python.kenfish_stop = function() {
	var code = 'Lmst.StopTheFish()\n';
	return code;
};



Blockly.Python.kenfish_SM_servo_l = function() {
	var code;
	var dropdown_lmst_gear = this.getFieldValue('lmst_servo_gl');
	var s = this.getFieldValue('lmst_servo_dl');
	if (s == 0) {
		dropdown_lmst_gear = (7 - Number(dropdown_lmst_gear));
	} else {
		dropdown_lmst_gear = (7 + Number(dropdown_lmst_gear));
	}
	// TODO: Assemble Python into code variable.
	var code = 'Lmst.SetSteerDirection(2,' + dropdown_lmst_gear + ')\n';

	return code;

};

Blockly.Python.kenfish_Extend_servo_1 = function() {
	var code;
	var dropdown_lmst_gear = this.getFieldValue('lmst_Extend_servo_g1');
	var s = this.getFieldValue('lmst_Extend_servo_d1');
	if (s == 0) {
		dropdown_lmst_gear = (0 - Number(dropdown_lmst_gear));
	} else {
		dropdown_lmst_gear = (Number(dropdown_lmst_gear));
	}
	// TODO: Assemble Python into code variable.
	var code = 'Lmst.SetSteerDirection(4,' + dropdown_lmst_gear + ')\n';

	return code;

};

Blockly.Python.kenfish_Extend_servo_2 = function() {
	var code;
	var dropdown_lmst_gear = this.getFieldValue('lmst_Extend_servo_g2');
	var s = this.getFieldValue('lmst_Extend_servo_d2');
	if (s == 0) {
		dropdown_lmst_gear = (0 - Number(dropdown_lmst_gear));
	} else {
		dropdown_lmst_gear = (Number(dropdown_lmst_gear));
	}
	// TODO: Assemble Python into code variable.
	var code = 'Lmst.SetSteerDirection(5,' + dropdown_lmst_gear + ')\n';

	return code;

};

Blockly.Python.kenfish_SM_servo_r = function() {
	var code;
	var dropdown_lmst_gear = this.getFieldValue('lmst_servo_gr');
	var s = this.getFieldValue('lmst_servo_dr');
	if (s == 1) {
		dropdown_lmst_gear = (7 - Number(dropdown_lmst_gear));
	} else {
		dropdown_lmst_gear = (7 + Number(dropdown_lmst_gear));
	}
	// TODO: Assemble Python into code variable.
	var code = 'Lmst.SetSteerDirection(3,' + dropdown_lmst_gear + ')\n';

	return code;

};


Blockly.Python.kenfish_SM_motor_l = function() {
	var code;
	var dropdown_lmst_gear = this.getFieldValue('lmst_motor_gl');
	var s = this.getFieldValue('lmst_motor_dl');
	if (s == 1) {
		dropdown_lmst_gear = (7 - Number(dropdown_lmst_gear));
	} else {
		dropdown_lmst_gear = (7 + Number(dropdown_lmst_gear));
	}
	// TODO: Assemble Python into code variable.
	var code = 'Lmst.SetMotorSpeed(1,' + dropdown_lmst_gear + ')\n';

	return code;

};

Blockly.Python.kenfish_SM_motor_r = function() {
	var code;
	var dropdown_lmst_gear = this.getFieldValue('lmst_motor_gr');
	var s = this.getFieldValue('lmst_motor_dr');
	if (s == 1) {
		dropdown_lmst_gear = (7 - Number(dropdown_lmst_gear));
	} else {
		dropdown_lmst_gear = (7 + Number(dropdown_lmst_gear));
	}
	// TODO: Assemble Python into code variable.
	var code = 'Lmst.SetMotorSpeed(2,' + dropdown_lmst_gear + ')\n';

	return code;

};


Blockly.Python.kenfish_tail_speed = function() {
	var code;
	var dropdown_lmst_gear = this.getFieldValue('lmst_tail_speed');
	// TODO: Assemble Python into code variable.
	var code = 'Lmst.SetSteerSpeed(1,' + dropdown_lmst_gear + ')\n';

	return code;
};


Blockly.Python.kenfish_tail_direct = function() {
	var code;
	var dropdown_lmst_gear = this.getFieldValue('lmst_tail_direct_g');
	var s = this.getFieldValue('lmst_tail_direct_d');
	if (s == 1) {
		dropdown_lmst_gear = (7 - Number(dropdown_lmst_gear));
	} else {
		dropdown_lmst_gear = (7 + Number(dropdown_lmst_gear));
	}
	// TODO: Assemble Python into code variable.
	var code = 'Lmst.SetSteerDirection(1,' + dropdown_lmst_gear + ')\n';

	return code;

};


Blockly.Python.kenfish_delay_ms = function(block) {
	var number_kenfish_delay_value = block.getFieldValue('kenfish_delay_value');
	// TODO: Assemble Python into code variable.
	var code = 'time.sleep(' + number_kenfish_delay_value / 1000 + ')\n';

	return code;

	return code;
};

Blockly.Python.kenfish_Is = function(block) {
	var value = block.getFieldValue('lmst_Is');
	// TODO: Assemble Python into code variable.
	var code = 'Lmst.GetInfraredSensorState(' + value + ')';

	return [code, Blockly.Python.ORDER_LOGICAL_AND];
};

Blockly.Python.kenfish_Temp = function(block) {
	var value = block.getFieldValue('lmst_Temp');
	// TODO: Assemble Python into code variable.
	var code = 'Lmst.GetTemp(' + value + ')';

	return [code, Blockly.Python.ORDER_LOGICAL_AND];
};

Blockly.Python.kenfish_Humidity = function(block) {
	var value = block.getFieldValue('lmst_Humidity');
	// TODO: Assemble Python into code variable.
	var code = 'Lmst.GetHumidity(' + value + ')';

	return [code, Blockly.Python.ORDER_LOGICAL_AND];
};

Blockly.Python.kenfish_Press = function(block) {
	var value = block.getFieldValue('lmst_Press');
	// TODO: Assemble Python into code variable.
	var code = 'Lmst.GetPress(' + value + ')';

	return [code, Blockly.Python.ORDER_LOGICAL_AND];
};

Blockly.Python.kenfish_Electric = function(block) {
	var value = block.getFieldValue('lmst_Electric');
	// TODO: Assemble Python into code variable.
	var code = 'Lmst.GetElectric(' + value + ')';

	return [code, Blockly.Python.ORDER_LOGICAL_AND];
};

Blockly.Python.kenfish_Ahrs = function(block) {
	var value = block.getFieldValue('lmst_Ahrs');
	// TODO: Assemble Python into code variable.
	if (value == 1) {
		var code = 'Lmst.GetAhrsPich(2)';
	} else if (value == 2) {
		var code = 'Lmst.GetAhrsRoll(2)';
	} else if (value == 3) {
		var code = 'Lmst.GetAhrsYaw(2)';
	}

	return [code, Blockly.Python.ORDER_LOGICAL_AND];
};

Blockly.Python.kenfish_OCR = function(block) {
	// Null data type.
	return ['lzai.OCR()', Blockly.Python.ORDER_ATOMIC];
};
