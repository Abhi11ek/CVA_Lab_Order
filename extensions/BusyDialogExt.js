/**
 * Helps in creating a BusyDialogExt, which prevents closing the dialog, when Escape button is clicked.
 * 
 * @class
 * @public
 * @extends sap.m.BusyDialog
 * @file com.amat.spg.labord.extensions.BusyDialogExt
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"sap/m/BusyDialog"
], function(BusyDialog) {
	"use strict";

	return BusyDialog.extend("com.amat.spg.labord.extensions.BusyDialogExt", {

		/**
		 * Helps in creating a BusyDialogExt, which will prevent closing of it when Escape button is clicked.
		 * @class
		 * @public
		 * @alias com.amat.spg.labord.extensions.BusyDialogExt
		 */
		constructor: function() {
			BusyDialog.prototype.constructor.apply(this, arguments);
			this.attachEvent("onkeydown", function(e) {
				if (e.keyCode === 27) {
					e.preventDefault();
					e.stopPropagation();
				}
			});
		},

		/**
		 * This method re-renders the given control.
		 * @name rerender
		 */
		renderer: {

		},

		/**
		 * This method helps in preventing busy dialog from closing.
		 * @name close
		 */
		close: function() {
			return;
		},

		/**
		 * This method helps in creating the prototype of the given control.
		 * @name onAfterRendering
		 */
		onAfterRendering: function() {
			sap.m.BusyDialog.prototype.onAfterRendering.apply(this);
		}

	});

});