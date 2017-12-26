'use strict';
//goog.provide('Blockly.Arduino.Kenblcok');
//goog.require('Blockly.Arduino');

goog.provide('Blockly.JavaScript.Kenblcok');

goog.require('Blockly.JavaScript');

Blockly.JavaScript['kenfish_repeat_ext'] = function(block) {
	// Repeat n times.
	if (block.getField('TIMES')) {
		// Internal number.
		var repeats = String(Number(block.getFieldValue('TIMES')));
	} else {
		// External number.
		var repeats = Blockly.JavaScript.valueToCode(block, 'TIMES',
			Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	}
	var branch = Blockly.JavaScript.statementToCode(block, 'DO');
	branch = Blockly.JavaScript.addLoopTrap(branch, block.id);
	var code = '';
	var loopVar = Blockly.JavaScript.variableDB_.getDistinctName(
		'count', Blockly.Variables.NAME_TYPE);
	var endVar = repeats;
	if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
		var endVar = Blockly.JavaScript.variableDB_.getDistinctName(
			'repeat_end', Blockly.Variables.NAME_TYPE);
		code += 'var ' + endVar + ' = ' + repeats + ';\n';
	}
	code += '{"type":3,"id":64,"c":"logic_repeat","times":' + endVar + ', "contents":[\n' +
		branch + ' {"type":3,"id":64,"c":"logic_end"}\n]},\n';
	return code;
};

Blockly.JavaScript['kenfish_loop'] = function(block) {
	// Repeat n times.
	if (block.getField('TIMES')) {
		// Internal number.
		var repeats = String(Number(block.getFieldValue('TIMES')));
	} else {
		// External number.
		var repeats = Blockly.JavaScript.valueToCode(block, 'TIMES',
			Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	}
	var branch = Blockly.JavaScript.statementToCode(block, 'DO');
	branch = Blockly.JavaScript.addLoopTrap(branch, block.id);
	var code = '';
	var loopVar = Blockly.JavaScript.variableDB_.getDistinctName(
		'count', Blockly.Variables.NAME_TYPE);
	var endVar = repeats;
	if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
		var endVar = Blockly.JavaScript.variableDB_.getDistinctName(
			'repeat_end', Blockly.Variables.NAME_TYPE);
		code += 'var ' + endVar + ' = ' + repeats + ';\n';
	}
	code += '{"type":3,"id":64,"c":"logic_loop"' + ', "contents":[\n' +
		branch + ' {"type":3,"id":64,"c":"logic_end"}\n]},\n';
	return code;
};

Blockly.JavaScript['kenfish_head'] = function(block) {
	var dropdown_lmst_action;
	var dropdown_lmst_gear = this.getFieldValue('lmst_lamp');
	// TODO: Assemble JavaScript into code variable.
	//Blockly.Arduino.definitions_['YJ_LmstSystemInit'] = '#include <LMST_ArduinoInterface.h>';
	//Blockly.Arduino.setups_['YJ_LmstSystemInit'] = 'YJ_LmstSystemInit();\n delay(2000);';
	if (dropdown_lmst_gear == 1) {
		dropdown_lmst_action = 6;
		var code = '{"type":3,"id":224,"c":"OpenLight","n":1, "value":1},\n';
	} else {
		dropdown_lmst_action = 7;
		var code = '{"type":3,"id":224,"c":"CloseLight","n":1, "value":1},\n';
	}


	return code;
};

Blockly.JavaScript['kenfish_ctrl'] = function(block) {
	// Numeric value.
	//var code = parseFloat(block.getFieldValue('NUM')) ;
	var dropdown_lmst_action = this.getFieldValue('lmst_action');
	var dropdown_lmst_gear = this.getFieldValue('lmst_gear');
	Blockly.JavaScript.controls_repeat_ext(block);
	// TODO: Assemble JavaScript into code variable.
	Blockly.JavaScript.definitions_['YJ_LmstSystemInit'] = '#include <LMST_ArduinoInterface.h>';
	//Blockly.JavaScript.setups_['YJ_LmstSystemInit'] = 'YJ_LmstSystemInit();\n delay(2000);';
	var code = 'YJ_LmstCtrl(' + dropdown_lmst_action + ',' + dropdown_lmst_gear + ');\n';

	return code;
};

//Blockly.Arduino.kenfish_ctrl = function() {
//		var dropdown_lmst_action =this.getFieldValue('lmst_action');
//		var dropdown_lmst_gear   =this.getFieldValue('lmst_gear');
//	  // TODO: Assemble JavaScript into code variable.
//		Blockly.Arduino.definitions_['YJ_LmstSystemInit'] = '#include <LMST_ArduinoInterface.h>';
//		Blockly.Arduino.setups_['YJ_LmstSystemInit'] = 'YJ_LmstSystemInit();\n delay(2000);';
//		var code ='YJ_LmstCtrl('+ dropdown_lmst_action + ',' + dropdown_lmst_gear + ');\n';
//		return code;
//};

Blockly.JavaScript.kenfish_stop = function() {
	var code = '{"type":3,"id":64,"c":"StopTheFish"},\n';
	return code;
};



Blockly.JavaScript.kenfish_SM_servo_l = function() {
	var code;
	var dropdown_lmst_gear = this.getFieldValue('lmst_servo_gl');
	var s = this.getFieldValue('lmst_servo_dl');
	if (s == 0) {
		dropdown_lmst_gear = (7 - Number(dropdown_lmst_gear));
	} else {
		dropdown_lmst_gear = (7 + Number(dropdown_lmst_gear));
	}
	// TODO: Assemble JavaScript into code variable.
	var code = '{"type":3,"id":16,"c":"SetSteerDirection_l","n":1, "value":' + dropdown_lmst_gear + '},\n';

	return code;

};

Blockly.JavaScript.kenfish_SM_servo_r = function() {
	var code;
	var dropdown_lmst_gear = this.getFieldValue('lmst_servo_gr');
	var s = this.getFieldValue('lmst_servo_dr');
	if (s == 1) {
		dropdown_lmst_gear = (7 - Number(dropdown_lmst_gear));
	} else {
		dropdown_lmst_gear = (7 + Number(dropdown_lmst_gear));
	}
	// TODO: Assemble JavaScript into code variable.
	var code = '{"type":3,"id":16,"c":"SetSteerDirection_r","n":1, "value":' + dropdown_lmst_gear + '},\n';

	return code;

};


Blockly.JavaScript.kenfish_SM_motor_l = function() {
	var code;
	var dropdown_lmst_gear = this.getFieldValue('lmst_motor_gl');
	var s = this.getFieldValue('lmst_motor_dl');
	if (s == 1) {
		dropdown_lmst_gear = (7 - Number(dropdown_lmst_gear));
	} else {
		dropdown_lmst_gear = (7 + Number(dropdown_lmst_gear));
	}
	// TODO: Assemble JavaScript into code variable.
	var code = '{"type":3,"id":16,"c":"SetMotorSpeed_r","n":1, "value":' + dropdown_lmst_gear + '},\n';

	return code;

};

Blockly.JavaScript.kenfish_SM_motor_r = function() {
	var code;
	var dropdown_lmst_gear = this.getFieldValue('lmst_motor_gr');
	var s = this.getFieldValue('lmst_motor_dr');
	if (s == 1) {
		dropdown_lmst_gear = (7 - Number(dropdown_lmst_gear));
	} else {
		dropdown_lmst_gear = (7 + Number(dropdown_lmst_gear));
	}
	// TODO: Assemble JavaScript into code variable.
	var code = '{"type":3,"id":16,"c":"SetMotorSpeed_l","n":1, "value":' + dropdown_lmst_gear + '},\n';

	return code;

};


Blockly.JavaScript.kenfish_tail_speed = function() {
	var code;
	var dropdown_lmst_gear = this.getFieldValue('lmst_tail_speed');
	// TODO: Assemble JavaScript into code variable.
	var code = '{"type":3,"id":240,"c":"SetSpeed","n":1, "value":' + dropdown_lmst_gear + '},\n';

	return code;
};


Blockly.JavaScript.kenfish_tail_direct = function() {
	var code;
	var dropdown_lmst_gear = this.getFieldValue('lmst_tail_direct_g');
	var s = this.getFieldValue('lmst_tail_direct_d');
	if (s == 1) {
		dropdown_lmst_gear = (7 - Number(dropdown_lmst_gear));
	} else {
		dropdown_lmst_gear = (7 + Number(dropdown_lmst_gear));
	}
	// TODO: Assemble JavaScript into code variable.
	var code = '{"type":3,"id":240,"c":"SetDirection","n":1, "value":' + dropdown_lmst_gear + '},\n';

	return code;

};


Blockly.JavaScript.kenfish_delay_ms = function(block) {
	var number_kenfish_delay_value = block.getFieldValue('kenfish_delay_value');
	// TODO: Assemble JavaScript into code variable.
	var code = '{"type":3,"id":64,"c":"logic_delay_ms","n":1, "value":' + number_kenfish_delay_value + '},\n';

	return code;

	return code;
};
