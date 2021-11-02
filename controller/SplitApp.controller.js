/**
 * SplitApp controller is the SplitApp Container for Labor Order application. It contains two NavContainers 
 * if running on tablet or desktop, and one on phone. The display of master NavContainer 
 * depends on the portrait/landscape mode of the device and the mode of SplitApp. 
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.SplitApp
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 10/12/2020  	Vimal Pandu				PCR032047    Phase - 2 changes					*
 * 05/19/2021  	Nageswar V				PCR035112    Phase - 4 changes					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"./BaseController",
	"../util/Constants",
	"../helper/FragmentHelper",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (BaseController, Constants, FragmentHelper, JSONModel, Device) {
	"use strict";
	var that = this;

	return BaseController.extend("com.amat.spg.labord.controller.SplitApp", {

		/**
		 * Called when the controller is instantiated. It sets up all the required event handling for the controller.
		 * @public
		 */
		onInit: function () {
			$("body").addClass(Constants.STYLE_SPG_LABORD);

			that = this;
			that._oFragment = new FragmentHelper(that);
			var oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			var oModel = that.getOwnerComponent().getModel();
			//Start of changes PCR032047++ changes
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);
			oLabOrdModel.setProperty("/bShowDetailContentBtn", true);
			//End of PCR032047++ changes
			that.setModel(oViewModel, Constants.MDL_APPVIEW);
			
			// Start of PCR035112++ changes
			var oDateTimePickerModel = new JSONModel();
			var aHours = [],
				aMinutes = [{
					min: "00"
				}, {
					min: "15"
				}, {
					min: "30"
				}, {
					min: "45"
				}];
			var iHour, sHrs, oElement;


			for (iHour = 0; iHour < 24; iHour++) {
				sHrs = iHour.toString();
				aHours.push({
					hour: (sHrs.length) === 1 ? "0" + sHrs : sHrs
				});
			}

			oDateTimePickerModel.setProperty("/Hours", aHours);
			oDateTimePickerModel.setProperty("/Minutes", aMinutes);
			that.getOwnerComponent().setModel(oDateTimePickerModel, "hourMinutes")
			// End of PCR035112++ changes

			oModel.metadataLoaded().then(jQuery.proxy(that.fnSetAppNotBusy.bind(that)));

			oModel.attachMetadataFailed(function (oEvent) {
				if (Device.system.desktop) {
					that._oFragment.showServiceError.call(that, oEvent.getParameters(), "fnSetAppNotBusy");
				} else {
					that.fnSetAppNotBusy(oEvent);
				}
			}, that);

			// apply content density mode to root view
			that.getView().addStyleClass(that.getOwnerComponent().getContentDensityClass());
		},

		/**
		 * Called when the controller is destroyed, and removes Lab Order theme from the app.
		 * @onExit
		 */
		onExit: function () {
			$("body").removeClass(Constants.STYLE_SPG_LABORD);
		},

		/**
		 * Method to alter the busy property of App Container
		 * based on metadata availability.
		 * @name fnSetAppNotBusy
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		fnSetAppNotBusy: function (oEvent) {
			var oViewModel = that.getModel(Constants.MDL_APPVIEW);

			oViewModel.setProperty("/busy", false);
			oViewModel.setProperty("/delay", 0);
		},

		//Start of PCR032047++ changes

		/**
		 * Method to toggle the widths of Master and Detail containers.
		 * @name showDashboard
		 * @public
		 */
		showDashboard: function () {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				bShowDetailContentBtn = oLabOrdModel.getProperty("/bShowDetailContentBtn");
			var oMasterContainer = sap.ui.getCore().byId($('div[id*="idSplitAppControl-Master"]').attr("id")).$();
			var oDetailContainer = sap.ui.getCore().byId($('div[id*="idSplitAppControl-Detail"]').attr("id")).$();

			oMasterContainer[0].style.transition = "width 1s";
			oDetailContainer[0].style.transition = "width 1s";

			oMasterContainer.width(bShowDetailContentBtn ? "calc(100% - 16px)" : "25rem");
			oDetailContainer.width(bShowDetailContentBtn ? "16px" : "Calc(100% - 25rem)");

			oLabOrdModel.setProperty("/bShowDetailContentBtn", !bShowDetailContentBtn);
		}

		//End of PCR032047++ changes

	});

});