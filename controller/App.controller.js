/**
 * App controller is the App Container for Labor Order applicaiton. 
 * that container will help in loading all its respective Views. 
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.App
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";
	
	return BaseController.extend("com.amat.spg.labord.controller.App", {
		
		/**
		 * Called when the App controller is instantiated. It sets ups Lab Order theme to the application.
		 * @public
		 */
		onInit: function () {
			$("body").addClass("spgLabOrd");
		},
		
		/**
		 * Called when the App controller is destroyed. It removed Lab Order theme to the application.
		 * @public
		 */
		onExit: function() {
			$("body").removeClass("spgLabOrd");
		}
		

	});

});