/**
 * Handles all the Personalization related interactions.
 * 
 * @class
 * @public
 * @extends sap.ui.base.Object
 * @file com.amat.spg.labord.helper.PersonalizationControl
 * @author Vimal Pandu
 * @since 29 October 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 10/29/2020  	Vimal Pandu				PCR032047    Initial Version					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"sap/ui/base/Object",
	"../util/Constants"
], function (Object, Constants) {
	"use strict";

	var oPersControl;
	var oPresContainer;
	var PersonalizationControl = Object.extend("com.amat.spg.labord.helper.PersonalizationControl", {

		/**
		 * Handles all the Personalization related interactions.
		 * @class
		 * @param {sap.ui.core.mvc.Controller} oController - current controller reference
		 * @public
		 * @alias com.amat.spg.labord.helper.PersonalizationControl
		 */
		constructor: function () {
			if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
				this.hasShellCont = true;
				
				var oPersonalizationService = sap.ushell.Container.getService(Constants.PROP_PRSNLZN_SRV);
				oPresContainer = oPersonalizationService.getPersonalizationContainer(Constants.PROP_SPG_VRNTSET);

				if (oPresContainer) {
					oPresContainer.fail(function () {
							//Error Handler
						})
						.done(function (oPersonalizationContainer) {
							// check if the current variant set exists, If not, add the new variant set to the container
							if (!(oPersonalizationContainer.containsVariantSet(Constants.PROP_SPG_VRNTSET))) {
								oPersonalizationContainer.addVariantSet(Constants.PROP_SPG_VRNTSET);
							}

							// get the variant set
							oPersControl = oPersonalizationContainer.getVariantSet(Constants.PROP_SPG_VRNTSET);
							this.oPersControl = oPersControl;
						});
				}
			} else {
				this.hasShellCont = false;
			}
		},

		/**
		 * An internal method which will fetch all the available variants.
		 * @name getAllVariants
		 * @param {requestCallback} fnCallBack - The callback that handles the response.
		 * @private
		 */
		getAllVariants: function (fnCallBack) {
			var aExistingVariants = [],
				aVariantKeys = [];
			var oVariantItemObject, oVariant;

			if (oPresContainer) {
				oPresContainer.fail(function () {
						fnCallBack(aExistingVariants);
					})
					.done(function () {
						aVariantKeys = oPersControl.getVariantKeys();

						for (var key in aVariantKeys) {
							if (aVariantKeys.hasOwnProperty(key)) {
								oVariantItemObject = {};
								oVariant = oPersControl.getVariant(aVariantKeys[key]);
								oVariantItemObject.VariantKey = aVariantKeys[key];
								oVariantItemObject.VariantName = oVariant.getVariantName();
								oVariantItemObject.VariantAuthor = oPersControl.getVariant(aVariantKeys[key]).getItemValue(Constants.PROP_AUTHOR);
								aExistingVariants.push(oVariantItemObject);
							}
						}

						fnCallBack(aExistingVariants);
					});
			}
		},

		/**
		 * An internal method to fetch desired variant.
		 * @name getVariantFromKey
		 * @param {String} sVariantKey - variant key
		 * @param {requestCallback} fnCallback - The callback that handles the response.
		 * @private
		 */
		getVariantFromKey: function (sVariantKey, fnCallback) {
			if (oPresContainer) {
				oPresContainer.fail(function () {
						if (fnCallback) {
							fnCallback("");
						}
					})
					.done(function () {
						fnCallback(oPersControl.getVariant(sVariantKey));
					});
			}
		},

		/**
		 * This method is to save the variant
		 * @name saveVariant
		 * @param {String} oVariantProp - Variant properties
		 * @param {String} oFilterData - Filter data object-> consolidated filters in JSON
		 * @param {requestCallback} fnCallBack - the call back function with the array of variants
		 */
		saveVariant: function (oVariantProp, oFilterData, fnCallBack) {
			var oShell = sap.ushell;
			var that = this;

			if (oPresContainer && oShell && oShell.Container) {
				oPresContainer.fail(function () {
						fnCallBack(false);
					})
					.done(function (oPersonalizationContainer) {
						try {
							var oVariant = oPersControl.getVariant(oVariantProp.key);
							oVariant = (oVariant) ? oVariant : oPersControl.addVariant(oVariantProp.name);

							if (oFilterData && oVariant) {
								oVariant._oVariantName = oVariantProp.name;
								oVariant.setItemValue(Constants.PROP_FILTER, oFilterData);

								if (oShell.Container) {
									oVariant.setItemValue(Constants.PROP_AUTHOR, oShell.Container.getUser().getId());
								}

								if (oVariantProp.def) {
									oPersControl.setCurrentVariantKey(oVariantProp.name);
								}
							}
							oPersonalizationContainer.save().fail(function () {
								fnCallBack(false);
							}).done(function () {
								fnCallBack(true);
							});
						} catch (e) {
							that._oFragment.showServiceError.call(that, e, "onVariantErrorClose");
						}
					});
			}
		},

		/**
		 * An event handler to close the Error Response message box.
		 * @name onVariantErrorClose
		 */
		onVariantErrorClose: function () {
			return;
		},

		/**
		 * An internal method to delete a desired variant.
		 * @name deleteVariants
		 * @param {array} aVariantKeys - variant keys
		 * @param {requestCallback} fnCallback - The callback that handles the response.
		 * @private
		 */
		deleteVariants: function (aVariantKeys, fnCallback) {
			if (oPresContainer) {
				oPresContainer.fail(function () {
						fnCallback(false);
					})
					.done(function (oPersonalizationContainer) {
						for (var iCount = 0; iCount < aVariantKeys.length; iCount++) {
							if (aVariantKeys[iCount]) {
								oPersControl.delVariant(aVariantKeys[iCount]);
							}
						}
						oPersonalizationContainer.save().fail(function () {
							fnCallback(false);
						}).done(function () {
							fnCallback(true);
						});
					});
			}
		}

	});

	return PersonalizationControl;

});