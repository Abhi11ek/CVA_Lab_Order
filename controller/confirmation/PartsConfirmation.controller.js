/**
 * PartsConfirmation controller helps in controlling the behaviour of all the view elements in the PartsConfirmation View.  
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.PartsConfirmation
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
	"../../util/EventTriggers",
	"../../util/Formatter",
	"../../util/IdHelper",
	"../../util/ServiceConfigConstants",
	"../../util/Util",
	"../../helper/FragmentHelper",
	"../../model/ModelObjects",
	"../../model/ResponseHandler",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, Constants, EventTriggers, Formatter, IDH, ServiceConfigConstants, Util, FragmentHelper, ModelObj,
	ResponseHandler, JSONModel, Device,
	Filter, FilterOperator) {
	"use strict";
	var that = this;

	return BaseController.extend("com.amat.spg.labord.controller.confirmation.PartsConfirmation", {

		formatter: Formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the controller is instantiated. It sets up all the required event handling for the controller.
		 * @public
		 */
		onInit: function () {
			that = this;
			that._oFragment = new FragmentHelper(that);
			that._oResourceBundle = that.getResourceBundle();
			that._oUtil = new Util(that);
			that._onObjectMatched();

			sap.ui.getCore().getEventBus().subscribe(Constants.EVT_PARTSCNF, Constants.PROP_DATA, function (channel, event, oEventData) {
				that._onObjectMatched();
			}, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler to close Dialog
		 * @name onDialogClose
		 */
		onDialogClose: function () {
			that._oFragment.destroyDialog.call(that);
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Internal method helps in creating view model.
		 * @name _onObjectMatched
		 * @private
		 */
		_onObjectMatched: function () {
			BaseController.prototype.createViewModel.call(this, {
				sModelName: Constants.MDL_PARTSVIEW
			});
		}

	});

});