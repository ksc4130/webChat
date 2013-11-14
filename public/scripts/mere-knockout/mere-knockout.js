//#region bootstrap
// Bind Twitter Tooltip
ko.bindingHandlers.tooltip = {
	update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var $element, options, tooltip;
		options = ko.utils.unwrapObservable(valueAccessor());
		$element = $(element);
		tooltip = $element.data('tooltip');
		if (tooltip) {
			$.extend(tooltip.options, options);
		} else {
			$element.tooltip(options);
		}
	}
};

// Bind Twitter Popover
ko.bindingHandlers.popover = {
	init: function (el, val, allVals, vm, bc) {
		var v = ko.unwrap(val());

		var popoverTitle = v.title,
			tmplId = v.template,
			trigger = v.trigger || 'click',
			delay = v.delay || 10,
			showDelay = v.showDelay || delay,
			hideDelay = v.hideDelay || delay,
			placement = v.placement,
			tmplHtml = $('#' + tmplId).html();

		//if (trigger === 'hover') {
		//    trigger = 'mouseenter mouseleave';
		//} else
		if (trigger === 'focus') {
			trigger = 'focus blur';
		}

		// create unique identifier to bind to
		var uuid = mere.utils.guid();
		var domId = "ko-bs-popover-" + uuid;

		// create correct binding context
		var childBindingContext = bc.createChildContext(vm);

		// create DOM object to use for popover content
		var tmplDom = $('<div/>', {
			"class": "ko-popover",
			"id": domId
		}).html(tmplHtml);

		// set content options
		options = {
			content: $(tmplDom[0]).outerHtml(),
			title: popoverTitle,
			placement: placement,
			container: v.container
		};

		// Need to copy this, otherwise all the popups end up with the value of the last item
		var popoverOptions = $.extend({}, ko.bindingHandlers.popover.options, options);
		var timeoutId;
		if (trigger === 'hover') {
			$(el).bind('mouseleave', function () {
				if (timeoutId) {
					clearTimeout(timeoutId);
					timeoutId = null;
				} else {
					$(this).popover('hide');
				}
			});
			$(el).bind('mouseenter', function () {
				if (timeoutId) {
					clearTimeout(timeoutId);
					timeoutId = null;
				}

				var that = this;
				timeoutId = setTimeout(function () {

					var popoverAction = 'show';
					var popoverTriggerEl = $(that);

					// popovers that hover should be toggled on hover
					// not stay there on mouseout
					if (trigger !== 'click') {
						popoverAction = 'toggle';
					}

					// show/toggle popover
					popoverTriggerEl.popover(popoverOptions).popover(popoverAction);

					// hide other popovers and bind knockout to the popover elements
					var popoverInnerEl = $('#' + domId);
					$('.ko-popover').not(popoverInnerEl).parents('.popover').remove();

					// if the popover is visible bind the view model to our dom ID
					if ($('#' + domId).is(':visible')) {

						ko.cleanNode($('#' + domId)[0]);
						ko.applyBindingsToDescendants(childBindingContext, $('#' + domId)[0]);

						/* Since bootstrap calculates popover position before template is filled,
						 * a smaller popover height is used and it appears moved down relative to the trigger element.
						 * So we have to fix the position after the bind
						 *  */

						var triggerElementPosition = $(el).offset().top;
						var triggerElementLeft = $(el).offset().left;
						var triggerElementHeight = $(el).outerHeight();
						var triggerElementWidth = $(el).outerWidth();

						var popover = $(popoverInnerEl).parents('.popover');
						var popoverHeight = popover.outerHeight();
						var popoverWidth = popover.outerWidth();
						var arrowSize = 10;

						switch (popoverOptions.placement) {
							case 'left':
							case 'right':
								popover.offset({ top: triggerElementPosition - popoverHeight / 2 + triggerElementHeight / 2 });
								break;
							case 'top':
								popover.offset({ top: triggerElementPosition - popoverHeight - arrowSize, left: triggerElementLeft - popoverWidth / 2 + triggerElementWidth / 2 });
								break;
							case 'bottom':
								popover.offset({ top: triggerElementPosition + triggerElementHeight + arrowSize, left: triggerElementLeft - popoverWidth / 2 + triggerElementWidth / 2 });
						}

					}

					timeoutId = null;
				}, delay);
			});
		} else {
			$(el).bind(trigger, function () {
				if (timeoutId)
					clearTimeout(timeoutId);

				var that = this;
				timeoutId = setTimeout(function () {

					var popoverAction = 'show';
					var popoverTriggerEl = $(that);

					// popovers that hover should be toggled on hover
					// not stay there on mouseout
					if (trigger !== 'click') {
						popoverAction = 'toggle';
					}

					// show/toggle popover
					popoverTriggerEl.popover(popoverOptions).popover(popoverAction);

					// hide other popovers and bind knockout to the popover elements
					var popoverInnerEl = $('#' + domId);
					$('.ko-popover').not(popoverInnerEl).parents('.popover').remove();

					// if the popover is visible bind the view model to our dom ID
					if ($('#' + domId).is(':visible')) {

						ko.cleanNode($('#' + domId)[0]);
						ko.applyBindingsToDescendants(childBindingContext, $('#' + domId)[0]);

						/* Since bootstrap calculates popover position before template is filled,
						 * a smaller popover height is used and it appears moved down relative to the trigger element.
						 * So we have to fix the position after the bind
						 *  */

						var triggerElementPosition = $(el).offset().top;
						var triggerElementLeft = $(el).offset().left;
						var triggerElementHeight = $(el).outerHeight();
						var triggerElementWidth = $(el).outerWidth();

						var popover = $(popoverInnerEl).parents('.popover');
						var popoverHeight = popover.outerHeight();
						var popoverWidth = popover.outerWidth();
						var arrowSize = 10;

						switch (popoverOptions.placement) {
							case 'left':
							case 'right':
								popover.offset({ top: triggerElementPosition - popoverHeight / 2 + triggerElementHeight / 2 });
								break;
							case 'top':
								popover.offset({ top: triggerElementPosition - popoverHeight - arrowSize, left: triggerElementLeft - popoverWidth / 2 + triggerElementWidth / 2 });
								break;
							case 'bottom':
								popover.offset({ top: triggerElementPosition + triggerElementHeight + arrowSize, left: triggerElementLeft - popoverWidth / 2 + triggerElementWidth / 2 });
						}

					}

					// bind close button to remove popover
					$(document).on('click', '[data-dismiss="popover"]', function (e) {
						popoverTriggerEl.popover('hide');
					});
				}, delay);
			});
		}

		// Also tell KO *not* to bind the descendants itself, otherwise they will be bound twice
		//return { controlsDescendantBindings: true }; //****************************************** ksc changed from true due losing orignal bindings
	},
	options: {
		placement: 'right',
		title: '',
		html: true,
		content: '',
		trigger: 'manual',
		delay: 10,
		showDelay: 10,
		hideDelay: 10
	}
};
//#endregion

//#region loading
/*
 <div style="display: none; cursor: wait; z-index: 999; position: absolute; width: auto; height: auto; left: 0; top: 0; right: 0; bottom: 0; background-color: #eee; background-color: rgba(0, 0, 0, .2);"
 id="loading">
 <img style="display: block; margin: 20px auto;" src="~/Content/styles/img/ajax-loading.gif" />
 <h4 id="loadingText" class="text-center"></h4>
 </div>
 */

//not done
//ko.bindingHandlers.loading = {
//    init: function(el, val, allVals, vm, bc) {
//        var v = ko.unwrap(val());

//        var text = v.text,
//            tmplId = v.template,
//            data = v.data,
//            predicate = v.predicate,
//            tmplHtml = $('#' + tmplId).html();


//    },
//    update: function(el, val, allVals, vm, bc) {

//    }
//};

//#endregion