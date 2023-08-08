var referThis;
sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, History, formatter, MessageToastFilter, FilterOperator, MessageBox) {
    "use strict";

    return BaseController.extend("brish.overtimeui.controller.Object", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit : function () {
            referThis = this;
            var oViewModel = new JSONModel({
                busy : true,
                delay : 0
            });
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            this.setModel(oViewModel, "objectView");
        },
        onNewEmployee: function(oEvent)
        {
            if(oEvent.getParameter("state"))
            {
                this.getView().byId("empId").setEnabled(true);
                this.getView().byId("empId").setValue();
                this.getView().byId("employeeName").setValue();
                this.getView().byId("designation").setValue();
                this.getView().byId("mailId").setValue();
                this.getView().byId("department").setSelectedKey(null);
                this.getView().byId("immediateSupervisor").setValue();
                this.getView().byId("hourleyPayRate").setValue();
            }
            else
            this.getView().byId("empId").setEnabled(false);
        },
        onDeleteEmployee: function(oEvent)
        {
            var oModel = this.getView().getModel();
            oModel.setUseBatch(false);
            var empId = this.getView().byId("empId").getValue();

            oModel.remove("/PersonalData('"+empId+"')", {               
                success: function(data) {                  
                    MessageBox.information("Employee Deleted", {
                        actions: [MessageBox.Action.CLOSE],                      
                        onClose: function (sAction) {
                            referThis.onNavBack();
                        }
                    });
                },
                error: function(oError) {                      
                }
            });
        },
        onSaveEmployees: function(oEvent)
        {
            var oModel = this.getView().getModel();
            var empChanges = {};           
                       
            var empId = this.getView().byId("empId").getValue();
            var employeeName = this.getView().byId("employeeName").getValue();
            var designation = this.getView().byId("designation").getValue();
            var mailId = this.getView().byId("mailId").getValue();
            var department = this.getView().byId("department").getSelectedKey();
            var immediateSupervisor = this.getView().byId("immediateSupervisor").getValue();
            var hourleyPayRate = this.getView().byId("hourleyPayRate").getValue();

            empChanges.employeeId = empId;
            empChanges.employeeName = employeeName;
            empChanges.designation = designation;
            empChanges.mailId = mailId;
            empChanges.department = department;
            empChanges.immediateSupervisor = immediateSupervisor;
            empChanges.hourleyPayRate = hourleyPayRate;

            var isNew = this.getView().byId("isNew").getState();

            if(isNew)
            {
                oModel.create("/PersonalData", empChanges, {                
                    success: function (data,response) {                                         
                        sap.m.MessageToast.show("New Employee Registered");                  
                    },
                    error: function (oError) {                  
                    }
                }); 
            }
            else
            {
            oModel.update("/PersonalData('"+empChanges.employeeId+"')", empChanges, {                
                success: function (data,response) {                                         
                    sap.m.MessageToast.show("Employee Information Updated");                  
                },
                error: function (oError) {                  
                }
            }); 
          }
        },
      
        onSaveLeaveRequest: function(oEvent)
        {
           
            var oModel = this.getView().getModel();
            oModel.setUseBatch(false);
            var empOtChanges = {};           
                       
            var RequestId = this.getView().byId("RequestId").getValue();
            var empId = this.getView().byId("employeeId").getValue();
            var DateRequestSubmitted = this.getView().byId("DateRequestSubmitted").getValue();   
            var OvertimeStartDate = this.getView().byId("OvertimeStartDate").getValue();   
            var OverstartEndDate = this.getView().byId("OverstartEndDate").getValue(); 
            var OvertimeReason = this.getView().byId("OvertimeReason").getSelectedKey(); 
           
            empOtChanges.RequestId = RequestId;
            empOtChanges.linkEmployee_employeeId = empId;
            empOtChanges.DateRequestSubmitted = new Date(DateRequestSubmitted);
            empOtChanges.OvertimeStartDate = new Date(OvertimeStartDate);
            empOtChanges.OverstartEndDate = new Date(OverstartEndDate);
            empOtChanges.OvertimeReason = OvertimeReason;  

            oModel.update("/OvertimeRequest('"+empOtChanges.RequestId+"')", empOtChanges, {                
                success: function (data,response) {                                         
                    sap.m.MessageToast.show("Overtime Request Changed");   
                    referThis.bindLeaveRequestTable();               
                },
                error: function (oError) {                  
                }
            }); 
        },


        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */


        /**
         * Event handler  for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the worklist route.
         * @public
         */
        onNavBack : function() {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                // eslint-disable-next-line fiori-custom/sap-no-history-manipulation
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched : function (oEvent) {
            this.getView().byId("isNew").setState(false);
            var sObjectId =  oEvent.getParameter("arguments").objectId;
            this._bindView("/PersonalData" + sObjectId);
            this.bindLeaveRequestTable();
        },

        bindLeaveRequestTable: function()
        {
            var leavereqTable = this.getView().byId("leavereqTable");
            var leavereqItems = this.getView().byId("leavereqItems").clone();
            var employeeId = this.getView().byId("employeeTitle").getText();
            var empId = [new Filter("linkEmployee_employeeId", FilterOperator.EQ, employeeId)];
            leavereqTable.bindAggregation("items",{path:"/OvertimeRequest",template:leavereqItems, 
            filters:empId});
        },
        onLeaveReqPress: function(oEvent)
        {
            
            var sObjectPath = oEvent.getSource().getBindingContext().sPath;

            this.getView().byId("leaveReqForm").bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this)                   
                }
            });
        },

        /**
         * Binds the view to the object path.
         * @function
         * @param {string} sObjectPath path to the object to be bound
         * @private
         */
        _bindView : function (sObjectPath) {
            var oViewModel = this.getModel("objectView");

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange : function () {
            var oView = this.getView(),
                oViewModel = this.getModel("objectView"),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }

            var oResourceBundle = this.getResourceBundle()
             //   oObject = oView.getBindingContext().getObject(),
               // sObjectId = oObject.employeeName,
                //sObjectName = oObject.PersonalData;

                //oViewModel.setProperty("/busy", false);
                //oViewModel.setProperty("/shareSendEmailSubject",
                  //  oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
                //oViewModel.setProperty("/shareSendEmailMessage",
                   // oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        }
    });

});
