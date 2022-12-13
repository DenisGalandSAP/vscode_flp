sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/m/MessageBox'],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageBox) {
    'use strict';

    return Controller.extend('z.project1.controller.View1', {
      onInit: function () {},
      press: function () {
        var sGuidString = this._createuuid();
        var s = '#test-display';
        var sSemobj = s.split('-')[0].split('#')[1];
        var sAction = s.split('-')[1];
        this.getView()
          .getModel()
          .create(
            '/ZI_FLPTRACK',
            { Guid: sGuidString, Semantic: sSemobj, Action: sAction },
            {
              success: () => {
                MessageBox.success('it works');
              },
              error: () => {
                debugger;
              }
            }
          );
      },
      _createuuid: function () {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
          (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
        );
      }
    });
  }
);
