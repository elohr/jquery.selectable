/*
 * jquery.dateRangePicker
 * https://elohr.me/
 *
 * Copyright (c) 2014 elohr
 * Licensed under the MIT license.
 */
 
function Selectable(element, options) {
    'use strict';

    var s = {
        lastSearchValue: '',
        
        selectedOptions: [],

        selectedOptionsContainer: window.jQuery('<ul/>'),

        liForSelectButton: window.jQuery('<li/>', {
            class: 'selectable-button-container'
        }),

        selectButton: window.jQuery('<button/>', {
            type: 'button',
            text: 'Select'
        }),

        overlay: window.jQuery('<div/>', {
            class: 'plugin-overlay selectable-overlay'
        }),

        popup: window.jQuery('<div/>', {
            class: 'selectable-popup'
        }),

        defaultOptions: $(element).children(),

        closeButton: window.jQuery('<img/>', {
            class: 'selectable-close-icon',
            src: 'css/close.png'
        }),

        searchForm: window.jQuery('<form/>', {
            action: options.formAction,
            method: options.formMethod
        }),

        searchLabel: window.jQuery('<label>Search</label>'),

        searchBox: window.jQuery('<input/>', {
            class: 'selectable-search',
            type: 'text',
            name: 'search'
        }),

        popupTitleContainer: window.jQuery('<div/>', {
            class: 'selectable-popup-title-container'
        }),

        popupTitle: window.jQuery('<div/>', {
            class: 'selectable-popup-title'
        }),

        resultsContainer: window.jQuery('<div/>', {
            class: 'selectable-results-container'
        }),

        placeholder: window.jQuery('<li/>', {
            class: 'selectable-placeholder'
        }),

        okButton: window.jQuery('<button/>', {
            class: 'button-selectable highlight-button-selectable'
        }),

        newButton: window.jQuery('<button/>', {
            class: 'button-selectable normal-button-selectable'
        }),

        init: function() {
            // If remoteSearch is true and action is empty show an error on console
            if(options.remoteSearch && !options.formAction) {
                console.log('Error init Selectable: remoteSearch is true but no formAction was specified.');
                return;
            }

            // Detach default options from DOM
            s.defaultOptions.addClass('selectable-default-option selectable-result-item').detach();

            // Add Events to DOM Elements
            s.closeButton.click(s.close);
            s.overlay.click(s.close);
            s.okButton.click(s.close);
            s.searchLabel.click(s.focusSearchBox);
            s.searchBox.keyup(s.searchKeyUp);
            s.selectButton.focus(s.open);
            s.resultsContainer.on('click', '.selectable-result-item', s.resultClicked);
            s.selectedOptionsContainer.on('click', '.selectable-li', s.liOptionClicked);
            $(element).on('destroyed', s.kill);

            if(options.showNewButton) {
                s.newButton.click(options.newButtonClicked);
            }

            // Append elements to form
            s.searchForm.append(s.searchLabel, [s.searchBox]);

            // Only show title if it is not empty
            if(!options.popupTitle) {
                options.popupTitle = $(element).attr('data-title');
            }

            if(options.popupTitle) {
                s.popupTitle = s.popupTitle.text(options.popupTitle);
                s.popupTitleContainer.append(s.popupTitle)
                s.popup.append(s.popupTitleContainer);
            }

            // Only show placeholder if it is not empty
            if(!options.placeholder) {
                options.placeholder = $(element).attr('data-placeholder');
            }

            if(options.placeholder) {
                s.placeholder.text(options.placeholder);
                s.selectedOptionsContainer.prepend(s.placeholder);
            }

            // Edit Add button
            if(options.showNewButton) {
                s.newButton.text('New ' + options.popupTitle).css({
                    position: 'absolute',
                    left: '12px',
                    bottom: '12px'
                });
            } else {
                s.newButton.css('display', 'none');
            }

            // Edit OK button Text and Position
            s.okButton.text('OK').css({
                position: 'absolute',
                right: '12px',
                bottom: '0px'
            });

            // Append elements to Popup
            s.popup.append(s.closeButton, [s.searchForm, s.resultsContainer, s.newButton, s.okButton]);

            // Create element that will show selected options
            s.liForSelectButton.append(s.selectButton);
            s.selectedOptionsContainer.append(s.liForSelectButton);
            $(element).prepend(s.selectedOptionsContainer);

            // Append Popup and Overlay to DOM
            $(document.body).append(s.popup, [s.overlay]);

            if (options.fieldName === undefined) {
                options.fieldName = $(element).attr('data-title').replace(new RegExp(' ', 'g'), '_');
            }

            options.initialized();
        },

        open: function() {
            // Trigger Opening Event
            options.opening();
            s.addSelectedItemsAndDefaultOptions();
            s.previousOverlay = $('.plugin-overlay:visible');
            s.previousOverlay.hide();
            s.overlay.show();

            s.popup.css({
                left: ($(window).width() - s.popup.outerWidth()) / 2,
                top: $(element).offset().top + 24
            }).addClass('plugin-fade');

            // Trigger Opened Event
            options.opened(element);

            s.searchBox.val('');
            s.focusSearchBox();
        },

        close: function() {
            var hiddenFieldValue = [],
                hiddenField = $('<input>').attr({
                    type: 'hidden',
                    name: options.fieldName,
                    class: 'selectable-hidden-' + options.fieldName
                });

            // Tirgger closing event
            options.closing();

            // Assign an ID to hidden field
            if(options.fieldId) {
                hiddenField.attr('id', options.fieldId);
            }

            // Clear Selected Options
            s.selectedOptions = [];
            s.selectedOptionsContainer.children('.selectable-li').remove();

            // Add selected options to selectedOptionsContainer
            s.resultsContainer.children('.selectable-selected').each(function() {
                var t = $(this);
                t.detach();
                s.selectedOptions.push(t);
                hiddenFieldValue.push(t.attr('data-value'));
                s.selectedOptionsContainer.prepend('<li data-value="' + t.attr('data-value') + '" class="selectable-li">' + t.text() + '</li>');
            });

            // If there is already a hidden field then remove it
            $(element).siblings('.selectable-hidden-' + options.fieldName).remove();

            // Add hidden field
            hiddenField.val(JSON.stringify(hiddenFieldValue));
            $(element).after(hiddenField);

            if(options.placeholder) {
                if(hiddenFieldValue.length > 0) {
                    s.placeholder.hide();
                } else {
                    s.placeholder.show();
                }
            }

            // Hide Popup
            s.overlay.hide();
            s.previousOverlay.show();
            s.popup.removeClass('plugin-fade');
            s.defaultOptions.detach();
            s.resultsContainer.children().remove();

            // Tirgger closed event
            options.closed(s.selectedOptions);
        },

        focusSearchBox: function() {
            s.searchBox.focus();
        },

        searchKeyUp: function() {
            var value = s.searchBox.val().trim();

            // TODO: Keep cache of results

            if(value.length < options.minLengthForSearch) {
                s.resultsContainer.children().not('.selectable-selected').not('.selectable-default-option').remove();
                s.addSelectedItemsAndDefaultOptions();
                options.minSearchLengthNotReached();
            } else if(s.lastSearchValue !== value) {
                s.search(value);
            }
        },

        search: function(value) {
            var wait;

            s.lastSearchValue = value;
            clearTimeout($.data(s.searchBox[0], 'timer'));

            wait = setTimeout(function() {
                s.submitSearch(value);
            }, options.searchDelay);
            
            s.searchBox.data('timer', wait);
        },

        submitSearch: function(value) {
            var existsValue = false;

            if(options.remoteSearch) {
                $.ajax({
                  url: options.formAction,
                  type: options.formMethod,
                  data: s.searchForm.serializeArray()
                }).done(function(data) {
                    s.resultsContainer.children().not('.selectable-selected').remove();

                    if(data.no_results) {
                        options.noResults();
                        return;
                    }

                    for (var i = data.results.length - 1; i >= 0; i--) {
                        s.resultsContainer.children().each(function() {
                            if($(this).text() === data.results[i]) {
                                existsValue = true;
                                return false;
                            }
                        });

                        if(!existsValue) {
                            if(data.results[i].value) {
                                s.resultsContainer.append('<span class="selectable-result-item" data-value="' + data.results[i].value + '">' + data.results[i].text + '</span>');
                            } else {
                                s.resultsContainer.append('<span class="selectable-result-item" data-value="' + data.results[i] + '">' + data.results[i] + '</span>');
                            }
                        }
                    };

                    options.optionsLoaded();
                }).fail(function(xhr) {
                    options.searchFailed(xhr);
                });
            }

            options.searching(value);

            s.resultsContainer.children().not('.selectable-selected').each(function() {
                var t = $(this);

                s.hideItemIfNotMatchesSearch(t, value);
            });
        },

        hideItemIfNotMatchesSearch: function(t, value) {
            if(t.text().toLowerCase().indexOf(value.toLowerCase()) < 0) {
                if(t.hasClass('selectable-default-option')) {
                    t.detach();
                } else {
                    t.remove();
                }
            }
        },

        resultClicked: function() {
            var t = $(this);

            if(t.hasClass('selectable-selected')) {
                s.removeFromSelection(t.attr('data-value'));
                s.hideItemIfNotMatchesSearch(t, s.searchBox.val().trim());
                options.selectionRemoved();
                s.focusSearchBox();
            } else {
                if(!options.allowMultipleSelect) {
                    t.siblings('.selectable-selected').each(function() {
                        s.removeFromSelection($(this).attr('data-value'));
                    });
                }
                
                t.addClass('selectable-selected');
                options.selectionAdded();

                if(!options.allowMultipleSelect) {
                    s.close();
                } else {
                    s.focusSearchBox();
                }
            }
        },

        // Remove option from selectedOptionsContainer and hidden field
        liOptionClicked: function() {
            var hiddenField = $(element).siblings('.selectable-hidden-' + options.fieldName),
                hiddenFieldValue = JSON.parse(hiddenField.val());

            hiddenFieldValue.splice(hiddenFieldValue.indexOf($(this).attr('data-value')), 1);

            if(hiddenFieldValue.length > 0) {
                hiddenField.val(JSON.stringify(hiddenFieldValue));
            } else {
                hiddenField.remove();
                if(options.placeholder) {
                    s.placeholder.show();
                }
            }

            s.removeFromSelection($(this).attr('data-value'));
            $(this).remove();

            // Trigger activeSelectionRemoved event
            options.activeSelectionRemoved();
        },

        removeFromSelection: function(objectValue) {
            var found = false;

            $(s.selectedOptions).each(function(index) {
                if($(this).attr('data-value') === objectValue) {
                    $(this).removeClass('selectable-selected');
                    s.selectedOptions.splice(index, 1);
                    found = true;
                    return false;
                }
            });

            if(!found) {
                s.resultsContainer.children('.selectable-result-item').each(function(index) {
                    if($(this).attr('data-value') === objectValue) {
                        $(this).removeClass('selectable-selected');
                        return false;
                    }
                });
            }
        },

        addSelectedItemsAndDefaultOptions: function() {
            s.resultsContainer.append(s.selectedOptions);
            if(s.selectedOptions.length === 0) {
                s.resultsContainer.append(s.defaultOptions);
            } else {
                s.defaultOptions.each(function() {
                    var exists = false,
                        defaultOptionValue = $(this).attr('data-value');

                    $(s.selectedOptions).each(function() {
                        if(defaultOptionValue === $(this).attr('data-value')) {
                            exists = true;
                            return false;
                        }
                    });

                    if(!exists) {
                        s.resultsContainer.append($(this));
                    }
                });
            }
        },

        kill: function() {
            $(element).remove();
            s.overlay.remove();
            s.popup.remove();
        }
    };

    // Options
    options = options || {};

    options.popupTitle = options.popupTitle;
    options.formAction = options.formAction;
    options.formMethod = options.formMethod || 'POST';
    options.minLengthForSearch = options.minLengthForSearch || 2;
    options.allowMultipleSelect = options.allowMultipleSelect || false;
    options.fieldName = options.fieldName;
    options.fieldId = options.fieldId;
    options.placeholder = options.placeholder;
    options.remoteSearch = options.remoteSearch || false;
    options.showNewButton = options.showNewButton || false;
    options.searchDelay = options.searchDelay || 350;

    // Custom Event Callbacks
    options.initialized = options.initialized || function() {};
    options.selectionAdded = options.selectionAdded || function() {};
    options.selectionRemoved = options.selectionRemoved || function() {};
    options.activeSelectionRemoved = options.activeSelectionRemoved || function() {};
    options.opening = options.opening || function() {};
    options.opened = options.opened || function() {};
    options.closing = options.closing || function() {};
    options.closed = options.closed || function() {};
    options.searching = options.searching || function() {};
    options.searchFailed = options.searchFailed || function() {};
    options.optionsLoaded = options.optionsLoaded || function() {};
    options.minSearchLengthNotReached = options.minSearchLengthNotReached || function() {};
    options.newButtonClicked = options.newButtonClicked || function() {};
    options.noResults = options.noResults || function() {};

    // Setup event capturing
    var events = {
        handleEvent: function(event) {
            switch (event.type) {
                case 'click': this.click(event); break;
            }
        },

        click: function(event) {
            s.open();
        }
    };

    s.init();
    s.selectButton[0].addEventListener('click', events, false);

    // Expose the API
    return {
        kill: s.kill,
        val: function() {
            return $(element).siblings('.selectable-hidden-' + options.fieldName).val();
        },
        selectionCount: function() {
            return s.selectedOptions.length;
        },
        open: s.open,
        close: s.close,
        removeSelection: function() {
            s.selectedOptionsContainer.children('.selectable-li').each(function() {
                s.removeFromSelection($(this).attr('data-value'))
                $(this).remove();
            });

            $(element).siblings('.selectable-hidden-' + options.fieldName).remove();
        },
        search: function(value) {
            if(value.trim().length > 0) {
                s.searchBox.val(value)
                s.search(value);
            }
        },
        addHiddenFieldToSearch: function(name, value) {
            var hiddenField;

            if(s.searchForm.children('[name="' + name + '"]').length === 0) {
                hiddenField = $('<input>').attr({
                    type: 'hidden',
                    name: name
                });

                hiddenField.val(value);
                s.searchForm.append(hiddenField);
            }
        },
        getNewButtonDOMElement: function() {
            return s.newButton;
        }
    };
}

if (window.jQuery) {
    (function($) {
        var pluginName = 'Selectable';
        
        var methods = {
            init: function(options) {
                return this.each(function() {
                    var $this = $(this);
                    var data = $this.data(pluginName);
                    
                    // If the plugin hasn't been initialized yet
                    if (!data){
                        var settings = {
                        };

                        if(options) {
                            $.extend(true, settings, options);
                        }

                        $this.data(pluginName, new Selectable($(this)[0], settings));
                    }
                });
            }
        };

        $.fn[pluginName] = function( method ) {
            if (methods[method]) {
                return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
            } else if ( typeof method === 'object' || !method ) {
                return methods.init.apply( this, arguments );
            } else {
                $.error( 'Method ' + method + ' does not exist in jQuery.' + pluginName );
            }
        };
    })(window.jQuery);
}
