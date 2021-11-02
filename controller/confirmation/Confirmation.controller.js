/**
 * Confirmation controller helps in controlling the behaviour of all the view elements in the Confirmation View. 
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.Confirmation
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
	"../../util/Formatter",
	"../../util/IdHelper",
	"../../util/Util",
	"../../extensions/ComboBoxExt",
	"../../helper/FragmentHelper",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, Constants, Formatter, IDH, Util, ComboBoxExt, FragmentHelper, Filter, FilterOperator) {
	"use strict";
	var that = this;

	return BaseController.extend("com.amat.spg.labord.controller.confirmation.Confirmation", {

		formatter: Formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/** 
		 * Called when the controller is instantiated. It sets up the event handling and other lifecycle tasks.
		 * @name onInit
		 */
		onInit: function () {
			that = this;
			that._oFragment = new FragmentHelper(that);
			that._oResourceBundle = that.getResourceBundle();
			that._oUtil = new Util(that);
			that._onObjectMatched();
			
			sap.ui.getCore().getEventBus().subscribe(Constants.EVT_CNF, Constants.PROP_DATA, function (channel, event, oEventData) {
				that._onObjectMatched();
			}, this);
		},
		
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		
		/** 
		 * Event handler for Selection Change event for Icon Tab bar
		 * @name onSelectConfirmationIconTabBar
		 * @param {sap.ui.base.Event} oEvent - selection change event
		 */
		onSelectConfirmationIconTabBar: function(oEvent) {
			var oIconTabBar = oEvent.getSource(),
				sSelKey = oIconTabBar.getSelectedKey();
				
			that.getRouter().getTargets().display(sSelKey);	
			sap.ui.getCore().getEventBus().publish(Constants.TAB_SPGLABORD + sSelKey, Constants.PROP_DATA, {Tab: sSelKey});
		},
		
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
				sModelName: Constants.MDL_CNFVIEW,
				sIconTabSelKey: "LaborConfirmation"
			});
		}

	});

});