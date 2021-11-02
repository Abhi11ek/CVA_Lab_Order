/**
 * NotFound controller helps in controlling the behaviour of all the view elements in the NotFound View.  
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.ErrorHandler
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"./BaseController",
	"../util/Constants"
], function (BaseController, Constants) {
	"use strict";

	return BaseController.extend("com.amat.spg.labord.controller.NotFound", {

		/**
		 * Navigates to the master when the link is pressed
		 * @name onLinkPressed
		 */
		onLinkPressed : function () {
			this.getRouter().navTo(Constants.ROUTE_WORKORDERS);
		}

	});

});