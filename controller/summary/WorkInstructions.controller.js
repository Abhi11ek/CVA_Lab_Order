/**
 * WorkInstructions controller helps in controlling the behaviour of all the view elements in the WorkInstructions View. 
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.WorkInstructions
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"../BaseController",
	"../../util/Constants",
	"../../util/IdHelper",
	"../../helper/FragmentHelper",
	"../../model/ResponseHandler",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (BaseController, Constants, IDH, FragmentHelper, ResponseHandler, JSONModel, Device) {
	"use strict";

	return BaseController.extend("com.amat.spg.labord.controller.summary.WorkInstructions", {

		/**
		 * Called when the controller is instantiated. It sets up all the required event handling for the controller.
		 * @public
		 */
		onInit: function () {
			sap.ui.getCore().getEventBus().subscribe("spgLabOrdWorkInstructions", Constants.PROP_DATA, function (channel, event, oEventData) {
				
			}, this);
		}

	});

});