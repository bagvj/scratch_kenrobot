'use strict';

goog.provide('Blockly.Blocks.Kenblock');

goog.require('Blockly.Blocks');

Blockly.Blocks['kenfish_repeat_ext'] = {
  /**
   * Block for repeat n times (external number).
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROLS_REPEAT_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "TIMES",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.loops.HUE,
      "tooltip": Blockly.Msg.CONTROLS_REPEAT_TOOLTIP,
      "helpUrl": Blockly.Msg.CONTROLS_REPEAT_HELPURL
    });
    this.appendStatementInput('DO')
        .appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
    this.setColour(120);
  }
};

Blockly.Blocks['kenfish_loop'] = {
	/**
	* Block for repeat n times (external number).
	* @this Blockly.Block
	*/
	init: function() {
	this.jsonInit({
	  "message0": "循环",
	  "args0": [
	    {
	      "type": "input_value",
	      "name": "TIMES",
	      "check": "Number"
	    }
	  ],
	  "previousStatement": null,
	  "nextStatement": null,
	  "colour": Blockly.Blocks.loops.HUE,
	  "tooltip": Blockly.Msg.CONTROLS_REPEAT_TOOLTIP,
	  "helpUrl": Blockly.Msg.CONTROLS_REPEAT_HELPURL
	});
	this.appendStatementInput('DO')
	    .appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
	this.setColour(120);
	}
};

Blockly.Blocks['kenfish_head'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("头灯")
			.appendField(new Blockly.FieldDropdown([["开","1"], ["关","2"]]), "lmst_lamp");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(230);
		this.setTooltip('摄像头舱led灯控制');
		this.setHelpUrl('');
	}
};

Blockly.Blocks['SASK_led'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("树莓派led")
			.appendField(new Blockly.FieldDropdown([["开","1"], ["关","2"]]), "lmst_SASK_led");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(230);
		this.setTooltip('树莓派led');
		this.setHelpUrl('');
	}
};

Blockly.Blocks.kenfish_ctrl = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("动作")
			.appendField(new Blockly.FieldDropdown([["前进","1"], ["后退","2"], ["左转","3"], ["右转","4"], ["停止","5"], ["开灯","6"], ["关灯","7"]]), "lmst_action")
			.appendField("挡位")
			.appendField(new Blockly.FieldDropdown([["1","1"], ["2","2"], ["3","3"], ["4","4"], ["5","5"], ["6","6"], ["7","7"]]), "lmst_gear");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(60);
		this.setTooltip('');
		this.setHelpUrl('');
	}
};

Blockly.Blocks.kenfish_stop = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("停止")
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(210);
		this.setTooltip('停止kenfish的所有动作');
		this.setHelpUrl('');
	}
};


Blockly.Blocks.kenfish_SM_servo_l = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("螺旋桨左舵机 转向")
			.appendField(new Blockly.FieldDropdown([["顺时","1"],["逆时","0"]]), "lmst_servo_dl")
			.appendField("角度")
			.appendField(new Blockly.FieldDropdown([["0°","0"],["15°","1"],["30°","2"], ["45°","3"],["60°","4"], ["75°","5"]]), "lmst_servo_gl");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(160);
		this.setTooltip('螺旋桨左舵机控制');
		this.setHelpUrl('');
	}
};


Blockly.Blocks.kenfish_SM_servo_r = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("螺旋桨右舵机 转向")
			.appendField(new Blockly.FieldDropdown([["顺时","1"],["逆时","0"]]), "lmst_servo_dr")
			.appendField("角度")
			.appendField(new Blockly.FieldDropdown([["0°","0"],["15°","1"],["30°","2"], ["45°","3"],["60°","4"], ["75°","5"]]), "lmst_servo_gr");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(160);
		this.setTooltip('螺旋桨右舵机控制');
		this.setHelpUrl('');
	}
};

Blockly.Blocks.kenfish_Extend_servo_1 = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("拓展舱1号舵机 转向")
			.appendField(new Blockly.FieldDropdown([["顺时","1"],["逆时","0"]]), "lmst_Extend_servo_d1")
			.appendField("角度")
			.appendField(new Blockly.FieldDropdown([["0°","0"],["15°","1"],["30°","2"], ["45°","3"],["60°","4"], ["75°","5"], ["90°","6"]]), "lmst_Extend_servo_g1");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(170);
		this.setTooltip('拓展舱1号舵机控制');
		this.setHelpUrl('');
	}
};

Blockly.Blocks.kenfish_Extend_servo_2 = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("拓展舱2号舵机 转向")
			.appendField(new Blockly.FieldDropdown([["顺时","1"],["逆时","0"]]), "lmst_Extend_servo_d2")
			.appendField("角度")
			.appendField(new Blockly.FieldDropdown([["0°","0"],["15°","1"],["30°","2"], ["45°","3"],["60°","4"], ["75°","5"], ["90°","6"]]), "lmst_Extend_servo_g2");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(170);
		this.setTooltip('拓展舱2号舵机控制');
		this.setHelpUrl('');
	}
};


Blockly.Blocks.kenfish_SM_motor_l = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("螺旋桨左电机 转向")
			.appendField(new Blockly.FieldDropdown([["顺时","1"],["逆时","0"]]), "lmst_motor_dl")
			.appendField("挡位")
			.appendField(new Blockly.FieldDropdown([["0","0"],["1","1"], ["2","2"],["3","3"], ["4","4"], ["5","5"], ["6","6"], ["7","7"]]), "lmst_motor_gl");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(160);
		this.setTooltip('螺旋桨左电机控制');
		this.setHelpUrl('');
	}
};


Blockly.Blocks.kenfish_SM_motor_r = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("螺旋桨右电机 转向")
			.appendField(new Blockly.FieldDropdown([["顺时","1"],["逆时","0"]]), "lmst_motor_dr")
			.appendField("挡位")
			.appendField(new Blockly.FieldDropdown([["0","0"],["1","1"], ["2","2"],["3","3"], ["4","4"], ["5","5"], ["6","6"], ["7","7"]]), "lmst_motor_gr");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(160);
		this.setTooltip('螺旋桨右电机控制');
		this.setHelpUrl('');
	}
};

Blockly.Blocks.kenfish_tail_speed = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("尾鳍舵机摆动速度")
			.appendField(new Blockly.FieldDropdown([["0","0"],["1","1"],["2","2"], ["3","3"],["4","4"], ["5","5"], ["6","6"], ["7","7"], ["8","8"],["9","9"], ["10","10"],["11","11"], ["12","12"], ["13","13"], ["14","14"], ["15","15"]]), "lmst_tail_speed")
			.appendField("挡");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(60);
		this.setTooltip('尾鳍舵机摆动速度控制');
		this.setHelpUrl('');
	}
};

Blockly.Blocks.kenfish_tail_direct = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("尾鳍舵机 方向")
			.appendField(new Blockly.FieldDropdown([["左摆","1"],["右摆","0"]]), "lmst_tail_direct_d")
			.appendField("角度")
			.appendField(new Blockly.FieldDropdown([["0°","0"],["10°","1"],["20°","2"], ["30°","3"],["40°","4"], ["50°","5"], ["60°","6"], ["70°","7"]]), "lmst_tail_direct_g");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(60);
		this.setTooltip('尾鳍舵机方向控制');
		this.setHelpUrl('');
	}
};

Blockly.Blocks.kenfish_delay_ms = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("延时")
			.appendField(new Blockly.FieldNumber(0, 0, 1000000), "kenfish_delay_value")
			.appendField("毫秒");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(210);
		this.setTooltip('延时');
		this.setHelpUrl('http://www.example.com/');
	}
};

Blockly.Blocks.kenfish_Is = {
	/**
	* Block for boolean data type: true and false.
	* @this Blockly.Block
	*/
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("红外")
			.appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "lmst_Is")
			.appendField("号检测到障碍物");
		this.setOutput(true, null);
		this.setTooltip('红外壁障传感器');
		this.setColour(270);
		this.setHelpUrl('http://www.example.com/');
	}
};

Blockly.Blocks.kenfish_Temp = {
	/**
	* Block for boolean data type: true and false.
	* @this Blockly.Block
	*/
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField(new Blockly.FieldDropdown([["摄像头舱", "1"], ["姿态传感器舱", "2"], ["摆动推进舱", "4"]]), "lmst_Temp")
			.appendField("温度");
		this.setOutput(true, null);
		this.setTooltip('温度传感器');
		this.setColour(270);
		this.setHelpUrl('http://www.example.com/');
	}
};

Blockly.Blocks.kenfish_Humidity = {
	/**
	* Block for boolean data type: true and false.
	* @this Blockly.Block
	*/
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField(new Blockly.FieldDropdown([["摄像头舱", "1"], ["摆动推进舱", "4"]]), "lmst_Humidity")
			.appendField("湿度");
		this.setOutput(true, null);
		this.setTooltip('湿度传感器');
		this.setColour(270);
		this.setHelpUrl('http://www.example.com/');
	}
};

Blockly.Blocks.kenfish_Press = {
	/**
	* Block for boolean data type: true and false.
	* @this Blockly.Block
	*/
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField(new Blockly.FieldDropdown([["姿态传感器舱", "2"]]), "lmst_Press")
			.appendField("压力");
		this.setOutput(true, null);
		this.setTooltip('压力传感器');
		this.setColour(270);
		this.setHelpUrl('http://www.example.com/');
	}
};

Blockly.Blocks.kenfish_Electric = {
	/**
	* Block for boolean data type: true and false.
	* @this Blockly.Block
	*/
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField(new Blockly.FieldDropdown([["摆动推进舱", "4"]]), "lmst_Electric")
			.appendField("电源电压");
		this.setOutput(true, null);
		this.setTooltip('电源电压');
		this.setColour(270);
		this.setHelpUrl('http://www.example.com/');
	}
};

Blockly.Blocks.kenfish_Ahrs = {
	/**
	* Block for boolean data type: true and false.
	* @this Blockly.Block
	*/
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("位姿")
			.appendField(new Blockly.FieldDropdown([["俯仰角", "1"],["偏航角", "2"],["翻滚角", "3"]]), "lmst_Ahrs");
		this.setOutput(true, null);
		this.setTooltip('位姿传感器');
		this.setColour(270);
		this.setHelpUrl('http://www.example.com/');
	}
};


Blockly.Blocks.kenfish_OCR = {
	/**
	* Block for null data type.
	* @this Blockly.Block
	*/
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldImage("../media/kenfish/SmartTuna-E-001.png", 20, 20, "*"))
			.appendField("摄像头舱文字识别");
		this.setOutput(true, null);
		this.setTooltip('摄像头舱文字识别');
		this.setColour(270);
		this.setHelpUrl('http://www.example.com/');
	}
};
