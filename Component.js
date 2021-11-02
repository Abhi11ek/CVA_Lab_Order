/**
 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
 * In this method, device model is set and the router is initialized.
 * 
 * @class
 * @public
 * @extends sap.ui.core.UIComponent
 * @name com.amat.spg.labord.Component
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 07/15/2021   Nageswar V				PCR035464	 Tech upgrade changes 				*
 * ------------------------------------------------------------------------------------ */
 
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"./controller/ListSelector",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, Device, ListSelector, JSONModel) {
	"use strict";

	return UIComponent.extend("com.amat.spg.labord.Component", {

		metadata : {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init : function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			
			this.oListSelector = new ListSelector();

			// set the device model
			var oDeviceModel = new JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.setModel(oDeviceModel, "device");

			// create the views based on the url/hash
			this.getRouter().initialize();
			
			//Apply SPG Theme
			if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
				if (sap.ushell.Container.getService("UserInfo")) {
					// PCR035464++; spg_bluecrystal to changed spg_belize
				    sap.ushell.Container.getService("UserInfo").getUser().setTheme("spg_belize");
				}
			}
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler is destroyed.
		 * @public
		 * @override
		 */
		destroy : function () {
			this.oListSelector.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
			
			//Apply SPG Theme
			if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
				if (sap.ushell.Container.getService("UserInfo")) {
					// PCR035464++; AMAT_bluecrystal to changed AMAT_belize
				    sap.ushell.Container.getService("UserInfo").getUser().setTheme("AMAT_Belize");
				}
			}
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass : function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else {
					this._sContentDensityClass = "sapUiSizeCompact";
				}
			}
			
			return this._sContentDensityClass;
		}

	});

});