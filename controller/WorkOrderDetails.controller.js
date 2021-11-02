/**
 * WorkOrderDetails controller helps in controlling the behaviour 
 * of all the view elements in the WorkOrderDetails View.  
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
 * 10/12/2020  	Vimal Pandu				PCR032047    Phase - 2 changes					*
 * 03/11/2021   Vimal Pandu				PCR033677 	 Phase - 3 changes 					*
 * 05/19/2021   Nageswar V				PCR035112	 Phase - 4 changes 					*
 * ------------------------------------------------------------------------------------ */
sap.ui.define([
	"./BaseController",
	"../extensions/ComboBoxExt",
	"../helper/FragmentHelper",
	"../model/ModelObjects",
	"../util/Constants",
	"../util/EventTriggers",
	"../util/Formatter",
	"../util/IdHelper",
	"../util/ServiceConfigConstants",
	"../util/Util",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, ComboBoxExt, FragmentHelper, ModelObj, Constants, EventTriggers, Formatter, IDH, ServiceConfigConstants, 
	Util, Device, Filter, FilterOperator) {
	"use strict";
	var that = this;

	return BaseController.extend("com.amat.spg.labord.controller.WorkOrderDetails", {

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

			BaseController.prototype.createViewModel.call(this, {
				sModelName: Constants.MDL_WODETAILSVIEW,
				busy: false,
				delay: 0,
				bShowEditBtn: true,
				bCancelWO: false,
				sWOAction: "", //PCR035112++
				sSegBtnSelKey: "Summary"
			});

			that.getView().addEventDelegate({
				onAfterShow: function () {
					that.getView().byId(IDH.id.WO_DET_SEGBTN).fireSelect();
				}.bind(that)
			});

			that.getRouter().getRoute(Constants.ROUTE_WODETAILS).attachPatternMatched(that._onObjectMatched, that);
			that.getOwnerComponent().getModel().metadataLoaded().then(that._onMetadataLoaded.bind(that));
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		
		/**
		 * Event handler for Work Order Segmented button
		 * @name onSegBtnSelectionChange
		 * @param {sap.ui.base.Event} oEvent - Selection change event
		 */
		onSegBtnSelectionChange: function (oEvent) {
			var oSegBtn = oEvent.getSource(),
				sSelKey = oSegBtn.getSelectedKey();
			var oWorkOrderViewLayout = that.getView().byId(IDH.id.WO_VIEW_LAYOUT);	
			
			oWorkOrderViewLayout.removeAllContent();
			that.getRouter().getTargets().display(sSelKey.toLowerCase() + "View");
			sap.ui.getCore().getEventBus().publish(Constants.TAB_SPGLABORD + sSelKey, Constants.PROP_DATA, {
				Tab: sSelKey
			});
		},
		
		/**
		 * Event handler for Work Order Complete button
		 * @name onPressCompleteWorkOrder
		 */
		onPressCompleteWorkOrder: function() {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
				
			//Start of PCR032047++ changes	
				
			var oProp = {
				Gsr: "GsrMandtFlag",
				Abatement: "AbatementMandtFlag",
				Pasr: "PasrMandtFlag",
				Fsr: "FsrMandtFlag",
				Moc: "MocMandtFlag",
				ChemAuth: "CauthMandtFlag"
			};
			var sKey, bHasValidCheckList = true;
			
			for (sKey in oProp) {
				if ((oCntx[oProp[sKey]] === "YES" || oCntx[oProp[sKey]] === "Y") && !oCntx[sKey]) {
					bHasValidCheckList = false;
					break;
				}
			}
			
			if (!bHasValidCheckList) {
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("validateCheckList"));
				return;
			}
			
			//End of PCR032047++ changes	
			
			var oViewModel = that.getModel(Constants.MDL_WODETAILSVIEW); // PCR035112++
			oViewModel.setProperty("/sWOAction", Constants.WO_ACT_COMP); // PCR035112++
			
			if (oCntx) {
				that._oFragment.openConfirmDialog.call(that, that._oResourceBundle.getText("completeWOConfirmMessage")+ " '" + oCntx.Servicecasenumber + "'");
			}
		},
		
		/**
		 * Event handler for Work Order Complete Confirm Dialog button
		 * @name onPressConfirmDialogOk
		 */
		onPressConfirmDialogOk:function() {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			that._fnUpdateWorkOrder({
				Servicecasenumber: oCntx.Servicecasenumber,
				Status: Constants.WO_WC_STAT
			});
		},
		
		/**
		 * Event handler for Work Order Cancel Dialog button
		 * @name onPressCancelWorkOrder
		 */
		onPressCancelWorkOrder: function() {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			
			if (oCntx) {	
				var oRejRsnTemp = new sap.ui.core.ListItem({
					text: "{KeyValue1}",
					key: "{GuidKey}"
				});
				var oRejRsnCmbx = new sap.m.ComboBox(IDH.id.REJ_RSN_CMBX, {
					width: "100%",
					selectionChange: that.onRejectionReasonSelectionChange
				});
				var oRejRsnLabel = new sap.m.Label({
					text: that._oResourceBundle.getText("selectCancelWOReason") + " '" + oCntx.Servicecasenumber + "'",
					labelFor: IDH.id.REJ_RSN_CMBX
				}).addStyleClass("sapUiSmallMarginBottom");
	
				oRejRsnCmbx.bindItems({
					path: "/MasterListSet",
					filters:[new Filter("IvFieldGroup", FilterOperator.EQ, "REJECTIONCODE")],
					template: oRejRsnTemp,
					templateShareable: false,
					placeholder: that._oResourceBundle.getText("selectRejectionReason")
				});
	
				var oDialog = new sap.m.Dialog({
					title: that._oResourceBundle.getText("alertHeading"),
					type: sap.m.DialogType.Message,
					state: Constants.STATE_WARNING,
					contentWidth: "25rem",
					content: [
						oRejRsnLabel,
						oRejRsnCmbx
					],
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Accept,
						text: that._oResourceBundle.getText("ok"),
						enabled: false,
						press: function () {
							var oViewModel = that.getModel(Constants.MDL_WODETAILSVIEW);
							var oRejCmbx = sap.ui.getCore().byId(IDH.id.REJ_RSN_CMBX);
								that._fnUpdateWorkOrder({
									Servicecasenumber: oCntx.Servicecasenumber,
									Status: Constants.WO_CANCEL_STAT,
									RejectionReason: oRejCmbx.getSelectedKey(),
									RejectionResonDescr: oRejCmbx.getValue()
								});
							
							oViewModel.setProperty("/bCancelWO", true);	
							oViewModel.setProperty("/sWOAction", Constants.WO_ACT_CANCEL);	// PCR035112++
							oDialog.close();
						}
					}),
					endButton: new sap.m.Button({
						text: that._oResourceBundle.getText("cancel"),
						press: function () {
							oDialog.close();
						}
					}),
					afterClose: function () {
						oDialog.destroy();
					}
				});
	
				oDialog.setModel(this.getOwnerComponent().getModel());
				jQuery.sap.syncStyleClass(Constants.STYLE_SIZECOMP, that.getView(), oDialog);
				oDialog.open();
			}
		},
		
		/**
		 * Event handler for rejection reason combobox
		 * @name onRejectionReasonSelectionChange
		 * @param {sap.ui.base.Event} oEvent - selection change event
		 */
		onRejectionReasonSelectionChange: function (oEvent) {
			var oCmbx = oEvent.getSource();
			var sSelKey = oCmbx.getSelectedKey();
			var oRejRsnDialog = oEvent.getSource().getParent();

			oRejRsnDialog.getBeginButton().setEnabled(sSelKey.length > 0);
			ComboBoxExt.prototype.onChange.call(this, oCmbx);
		},
		
		/**
		 * Success call back function of service order create event
		 * @name handleWorkOrderCreationSuccess
		 * @param {Object} oSuccess - success response
		 * @param {Object} oResponse - request response
		 */
		handleWorkOrderCreationSuccess: function (oSuccess, oResponse) {
			var oLabOrdModel = this.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			var oViewModel = that.getModel(Constants.MDL_WODETAILSVIEW),
				bCancelWO = oViewModel.getProperty("/bCancelWO"),
				sWOAction = oViewModel.getProperty("/sWOAction"); //PCR035112++
			
			that.onDialogClose();
			var bError = BaseController.prototype.handleErrorResponseInSuccessEvent.call(that, oSuccess);

			if (!bError) {
				that._oFragment.openResponseDialog.call(that, {
					msg: that._oResourceBundle.getText("workOrderText") + " '" + 
						 oCntx.Servicecasenumber + "' " + 
						 that._oResourceBundle.getText("hasBeenText") + " " + 
						 sWOAction, //PCR035112++
						 // (!bCancelWO ? "completed" : "cancelled"), PCR035112--
					statusText: that._oResourceBundle.getText("successStatusMessage"),
					statusState: sap.ui.core.ValueState.Success
				});
				
				that._fnUpdateElementBindings();
				sap.ui.controller(Constants.CONT_WORKORDERS)._fnTriggerSavedSearches(); //PCR032047++
			}
		},
		
		/**
		 * Error call back function of service order create event
		 * @name handleWorkOrderCreationFail
		 * @param {Object} oError - error response
		 */
		handleWorkOrderCreationFail: function (oError) {
			that._fnUpdateElementBindings();
			that.onDialogClose();
			that.handleEventFail(oError);
		},
		
		/**
		 * Event handler for Edit Work Order button
		 * @name onPressEditWorkOrder
		 * @param {sap.ui.base.Event} oEvent - press event
		 */
		onPressEditWorkOrder: function (oEvent) {
			sap.ui.controller(Constants.CONT_SUMMARY).onPressEditWorkOrder(oEvent);
		},
		
		/**
		 * Event handler for Update Work Order button
		 * @name onPressEditWorkOrder
		 * @param {sap.ui.base.Event} oEvent - press event
		 */
		onPressUpdateWorkOrder: function (oEvent) {
			sap.ui.controller(Constants.CONT_SUMMARY).onPressUpdateWorkOrder(oEvent);
		},
		
		/**
		 * Event handler to close Dialog
		 * @name onDialogClose
		 */
		onDialogClose: function () {
			that._oFragment.destroyDialog.call(that);
		},
		
		// Start of PCR035112++ changes
		
		/**
		 * Event handler to Approve Work Order
		 * @name onPressApproveWorkOrder
		 */
		onPressApproveWorkOrder: function () {
			var oViewModel = that.getModel(Constants.MDL_WODETAILSVIEW);
			oViewModel.setProperty("/sWOAction", Constants.WO_ACT_APPR);
			
			if (!this.oApproveDialog) {
				this.oApproveDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: this._oResourceBundle.getText("approveButtonText"),
					content: new sap.m.Text({ text: this._oResourceBundle.getText("approveWorkOrder") }),
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: this._oResourceBundle.getText("submitButtonText"),
						press: function () {
							var oView = this.getView(),
								oElementBinding = oView.getElementBinding();
							var oCntx = oElementBinding.getBoundContext().getObject();
							this.oApproveDialog.close();
							this._fnUpdateWorkOrder({
								Servicecasenumber: oCntx.Servicecasenumber,
								Status: oCntx.PartsInd ? Constants.WO_OPEN_STAT : Constants.WO_REL_STAT,
								RejectionReason: "",
								RejectionResonDescr: ""
							});
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: this._oResourceBundle.getText("cancel"),
						press: function () {
							this.oApproveDialog.close();
						}.bind(this)
					})
				});
			}

			this.oApproveDialog.open();
		},
		
		/**
		 * Event handler to Reject Work Order
		 * @name onPressApproveWorkOrder
		 */
		onPressRejectWorkOrder: function () {
			var oViewModel = that.getModel(Constants.MDL_WODETAILSVIEW);
			oViewModel.setProperty("/sWOAction", Constants.WO_ACT_REJ);
			
			if (!this.oRejectDialog) {
				this.oRejectDialog = new sap.m.Dialog({
					title: this._oResourceBundle.getText("rejectButtonText"),
					type: sap.m.DialogType.Message,
					content: [
						new sap.m.Label({
							text: this._oResourceBundle.getText("rejectWorkOrder"),
							labelFor: IDH.id.REJ_NOTES_TXTARA
						}),
						new sap.m.TextArea(IDH.id.REJ_NOTES_TXTARA, {
							width: "100%",
							placeholder: this._oResourceBundle.getText("addRejctionNotes")
						})
					],
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: this._oResourceBundle.getText("rejectButtonText"),
						press: function () {
							var oView = this.getView(),
								oElementBinding = oView.getElementBinding();
							var oCntx = oElementBinding.getBoundContext().getObject();
							var sText = sap.ui.getCore().byId(IDH.id.REJ_NOTES_TXTARA).getValue();
							this.oRejectDialog.close();
							this._fnUpdateWorkOrder({
								Servicecasenumber: oCntx.Servicecasenumber,
								Status: Constants.WO_REJ_STAT,
								RejectionReason: "",
								WoRejectionRsn: sText
							});
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: this._oResourceBundle.getText("cancel"),
						press: function () {
							this.oRejectDialog.close();
						}.bind(this)
					})
				});
			} else {
				sap.ui.getCore().byId(IDH.id.REJ_NOTES_TXTARA).setValue("");
			}

			this.oRejectDialog.open();
		},
		
		// End of PCR035112++ changes

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @name _onObjectMatched
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter(Constants.PROP_ARGS).objectId;
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oViewModel = that.getModel(Constants.MDL_WODETAILSVIEW);
			var oView = that.getView(),
				oDetailPage = oView.byId(IDH.id.WO_DET_PAGE);

			oDetailPage.setShowFooter(false);
			oViewModel.setProperty("/sSegBtnSelKey", "Summary");
			oLabOrdModel.setProperty("/GridDefaultSpan", "L4 M4 S6");
			oLabOrdModel.setProperty("/AttachmentsSpan", "L6 M12 S12");
			oLabOrdModel.setProperty("/CreateEvent", false);
			oLabOrdModel.setProperty("/UpdateEvent", false);
			oLabOrdModel.setProperty("/bBuildNoBusy", false); //PCR033677++
			oLabOrdModel.updateBindings();
			
			if (Device.system.desktop) {
				//Select Summary View
				that.getView().byId(IDH.id.WO_DET_SEGBTN).fireSelect();
			}
			
			//Hide Footer
			that._fnToggleFooterBar(false);

			that.getModel().metadataLoaded().then(function () {
				var sObjectPath = that.getModel().createKey(ServiceConfigConstants.workOrderSet, {
					Servicecasenumber: sObjectId
				});
				that._bindView("/" + sObjectPath);
			}.bind(that));
		},

		/**
		 * Binds the view to the object path. Makes sure that WorkOrderDetails view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @name _bindView
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = that.getModel(Constants.MDL_WODETAILSVIEW);

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			that.getView().bindElement({
				path: sObjectPath,
				events: {
					change: that._onBindingChange.bind(that),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		/** 
		 * Event handler for view bind-element change 
		 * @name _onBindingChange
		 */
		_onBindingChange: function () {
			var oView = that.getView(),
				oElementBinding = oView.getElementBinding();
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				that.getRouter().getTargets().display(Constants.ROUTE_NOTFOUND);
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				that.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var oCntx = oElementBinding.getBoundContext().getObject();
			oLabOrdModel.setProperty("/WOCntx", oCntx);

			//Perform Actions only for Open/Released Work Orders
			oLabOrdModel.setProperty(
				"/bModifyWO", oCntx.Status === Constants.WO_OPEN_STAT || 
							  oCntx.Status === Constants.WO_REL_STAT ||
							// Start of PCR035112++ changes
							  oCntx.OrderStatusTxt === Constants.STATUS_INPROGRESS ||
							  oCntx.OrderStatusTxt === Constants.STATUS_SUBMITTED || 
							  oCntx.OrderStatusTxt === Constants.STATUS_APPRD ||
							  oCntx.OrderStatusTxt === Constants.STATUS_REJECTED ||
							  oCntx.OrderStatusTxt === Constants.STATUS_SCHEDULED);
							// End of PCR035112++ changes

			var sPath = oElementBinding.getPath();
			that.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oLabOrdModel.setProperty("/PreTaskCheckList", new ModelObj(Constants.MOBJ_PRETASK_CHECKLIST));
			
			// Start of PCR033677++ changes
			//Get PreTask CheckList items
			var oLabOrdModel = that.getModel(Constants.MDL_LABORD);
			oLabOrdModel.setProperty("/BuildingNo", "");
			//that._fnGetToolData(oCntx.Serialnumber);
			BaseController.prototype._fnGetToolData.call(this, oCntx.Serialnumber, "details");
			// End of PCR033677++ changes
			
			// Start of PCR035112++ changes
			this._fnShowFooter();
			sap.ui.controller(Constants.CONT_SUMMARY)._fnToggleRejectionReason.call(this, oCntx);
			
			var bShowConfBtn = oCntx.OrderStatusTxt === Constants.STATUS_APPRD ||
							   oCntx.OrderStatusTxt === Constants.STATUS_SCHEDULED || 
							   oCntx.OrderStatusTxt === Constants.STATUS_OPEN ||
							   oCntx.OrderStatusTxt === Constants.STATUS_RELEASED;
			
			var bShowPCTBtn =  oCntx.OrderStatusTxt === Constants.STATUS_WORKCOMPLETED ||
							   oCntx.OrderStatusTxt === Constants.STATUS_CLOSED ||
							   oCntx.OrderStatusTxt === Constants.STATUS_OPEN ||
							   oCntx.OrderStatusTxt === Constants.STATUS_RELEASED;
			
			var bShowPCTBtnCrt = oCntx.OrderStatusTxt === Constants.STATUS_WORKCOMPLETED || 
								  oCntx.OrderStatusTxt === Constants.STATUS_OPEN ||
								  oCntx.OrderStatusTxt === Constants.STATUS_RELEASED;

			oLabOrdModel.setProperty("/bShowConfBtn", bShowConfBtn);
			oLabOrdModel.setProperty("/bShowPCTBtnCrt", bShowPCTBtnCrt);
			oLabOrdModel.setProperty("/bShowPCTBtn", bShowPCTBtn);
			// End of PCR035112++ changes
		},
		
		// Start of PCR035112++ changes
		/** 
		 * Internal Event handler to toggle footer
		 * @name _fnShowFooter
		 */
		_fnShowFooter: function () {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			if (oCntx) {
				var oView = that.getView(),
					oDetailPage = oView.byId(IDH.id.WO_DET_PAGE),
					bShowFooter = (oCntx.WoApprover === "X" && oCntx.OrderStatusTxt === Constants.STATUS_SUBMITTED);
				var aBtns = [
					IDH.id.APPR_BTN,
					IDH.id.REJ_BTN,
					IDH.id.WO_UPDT_BTN,
					IDH.id.WO_DET_CNCLBTN
				];
				
				var sBtnTxt = oCntx.OrderStatusTxt === Constants.STATUS_REJECTED ? 
						that._oResourceBundle.getText("resubmitButtonText") : that._oResourceBundle.getText("updateButtonText");
				oView.byId(IDH.id.WO_UPDT_BTN).setText(sBtnTxt);
		
				oDetailPage.setShowFooter(bShowFooter);
				
				for (var sId in aBtns) {
					oView.byId(aBtns[sId]).setVisible(false);
				}
				
				oView.byId(IDH.id.APPR_BTN).setVisible(bShowFooter);
				oView.byId(IDH.id.REJ_BTN).setVisible(bShowFooter);
			}
		},
		// End of PCR035112++ changes
		
		/** 
		 * Event handler for view metadata loaded
		 * @name _onMetadataLoaded
		 */
		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the WorkOrderDetails view
			var iOriginalViewBusyDelay = that.getView().getBusyIndicatorDelay(),
				oViewModel = that.getModel(Constants.MDL_WODETAILSVIEW);

			// Make sure busy indicator is displayed immediately when
			// WorkOrderDetails view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the WorkOrderDetails view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},
		
		/** 
		 * Internal event for updating Work Order
		 * @name _fnUpdateWorkOrder
		 * @param {Object} oData - view context
		 */
		_fnUpdateWorkOrder: function(oData) {
			var oWOCrtPayload = jQuery.extend({}, oData);	
			
			that.onDialogClose();
			that._oFragment.openBusyDialogExt.call(this, this._oResourceBundle.getText("busyDialogMsg"));
				
			var oWorkOrderEvt = new ModelObj(Constants.MOBJ_OEVENT);

			oWorkOrderEvt.sEventType = Constants.POST;
			oWorkOrderEvt.sEvent = EventTriggers.TRIGGER_CREATE_WORKORDER;
			oWorkOrderEvt.sEventSuccss = EventTriggers.CREATE_WORKORDER_SUCCESS;
			oWorkOrderEvt.sEventError = EventTriggers.CREATE_WORKORDER_FAIL;
			oWorkOrderEvt.sPostEntitySetPath = ServiceConfigConstants.workOrderStatusUpdateSet;
			oWorkOrderEvt.oPayload = oWOCrtPayload;
			oWorkOrderEvt.sSuccessHandler = "handleWorkOrderCreationSuccess";
			oWorkOrderEvt.sErrorHandler = "handleWorkOrderCreationFail";

			this.finishoDataModelregistartionProcessWithParams.call(this, oWorkOrderEvt);
		},
		
		/** 
		 * Internal event to togglign footer bar 
		 * @name _fnToggleFooterBar
		 * @param {Bool} bMode - footer mode
		 */
		_fnToggleFooterBar: function (bMode) {
			var oView = that.getView(),
				oDetailPage = oView.byId(IDH.id.WO_DET_PAGE);

			oDetailPage.setShowFooter(bMode);
			
			// Start of PCR035112++ changes
			
			if (!bMode) {
				that._fnShowFooter();
			} else {
				oView.byId(IDH.id.APPR_BTN).setVisible(false);
				oView.byId(IDH.id.REJ_BTN).setVisible(false);
				oView.byId(IDH.id.WO_UPDT_BTN).setVisible(bMode);
				oView.byId(IDH.id.WO_DET_CNCLBTN).setVisible(bMode);
			}
			
			// End of PCR035112++ changes
		},
		
		/** 
		 * Internal event cancel work order event
		 * @name _fnFireCancelButton
		 */
		_fnFireCancelButton: function () {
			that._fnShowFooter(); //PCR035112++
			that.getView().byId(IDH.id.WO_DET_CNCLBTN).firePress();
		},
		
		/** 
		 * Internal event to update view element binding
		 * @name _fnUpdateElementBindings
		 */
		_fnUpdateElementBindings: function () {
			var oView = that.getView(),
				oElementBinding = oView.getElementBinding();

			oElementBinding.refresh(true);
		},
		
		//Start of PCR032047++ changes
		
		/** 
		 * Event handler to toggler side content
		 * @name fireSideContentBtn
		 */
		fireSideContentBtn: function() {
			that.getView().byId(IDH.id.SIDE_CNT_BTN).firePress();	
		},
		
		/**
		 * Method to toggle the widths of Master and Detail containers.
		 * @name onToggleSideContent
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 */
		onToggleSideContent: function(oEvent) {
			var oBtn = oEvent.getSource(),
				sIcon = oBtn.getIcon();
				
			oBtn.setIcon(sIcon === IDH.icons.ICON_RIGHT_ARROW ? IDH.icons.ICON_LEFT_ARROW : IDH.icons.ICON_RIGHT_ARROW);
			sap.ui.controller(Constants.CONT_SPLITAPP).showDashboard();
			sap.ui.controller(Constants.CONT_WORKORDERS)._fnAdjustScrollContHeight();
		},
		
		//End of PCR032047++ changes
		
		// Start of PCR033677++ changes
		
		/**
		 * Internal Method to update Building number
		 * @name _fnUpdateBuildingNo
		 * @param {Object} oData - current view context
		 */
		_fnUpdateBuildingNo: function(oData) {
			var oCnxt = that.getView().getBindingContext().getObject();
			
			if (!oCnxt.BuildingNo && (oCnxt.Orderstatus !== Constants.STATUS_WORKCOMPLETED || oCnxt.Orderstatus !== Constants.STATUS_CLOSED)) {
				var oLabOrdModel = that.getModel(Constants.MDL_LABORD),
					sBuildingNo = oLabOrdModel.getProperty("/BuildingNo");
				oLabOrdModel.setProperty("/bBuildNoBusy", true);
				oCnxt.BuildingNo = oData.building;
				oCnxt.Category1 = Constants.PROP_LAB_CAT1; 
				
				var oODataModel = new sap.ui.model.odata.ODataModel(that.getModel().sServiceUrl, true);
				
				oODataModel.create("/" + ServiceConfigConstants.workOrderSet, oCnxt, {
					success: function(oData) {
						oLabOrdModel.setProperty("/bBuildNoBusy", false);
					},
					error: function(oError) {
						oLabOrdModel.setProperty("/bBuildNoBusy", false);
					}
				});
			}
		}
		
		// End of PCR033677++ changes

	});

});