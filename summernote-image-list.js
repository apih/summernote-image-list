(function(factory) {
	/* Global define */
	if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else if (typeof module === "object" && module.exports) {
		// Node/CommonJS
		module.exports = factory(require('jquery'));
	} else {
		// Browser globals
		factory(window.jQuery);
	}
}(function($) {
	$.extend($.summernote.plugins, {
		imageList: function(context) {
			var self = this;
			var ui = $.summernote.ui;
			var editor = context.layoutInfo.editor;

			var options = context.options;

			// Return early if not included in the toolbar
			var isIncludedInToolbar = false;

			for (var idx in options.toolbar) {
				var buttons = options.toolbar[idx][1];

				if ($.inArray("imageList", buttons) > -1) {
					isIncludedInToolbar = true;
					break;
				}
			}

			if (!isIncludedInToolbar) return;

			// Default options
			var defaultImageListOptions = {
				title: "Image List",
				tooltip: "Image List",
				buttonHtml: '<i class="fa fa-file-image-o"></i>',
				spinnerHtml: '<span class="fa fa-spinner fa-spin" style="font-size: 100px; line-height: 100px; margin-left: calc(50% - 50px)"></span>',
				endpoint: "",
				fullUrlPrefix: "",
				thumbUrlPrefix: ""
			};

			// Provided options
			var imageListOptions = typeof options.imageList === "undefined" ? {} : options.imageList;

			// Assign default values if not provided
			for (var propertyName in defaultImageListOptions) {
				if (imageListOptions.hasOwnProperty(propertyName) === false) {
					imageListOptions[propertyName] = defaultImageListOptions[propertyName];
				}
			}

			// Add the button
			context.memo("button.imageList", function() {
				var button = ui.button({
					contents: imageListOptions.buttonHtml,
					tooltip: imageListOptions.tooltip,
					click: function(event) {
						self.show();
					}
				});

				// Create jQuery object from button instance.
				return button.render();
			});

			this.createDialog = function(container) {
				var dialogOption = {
					title: imageListOptions.title,
					body: [
						'<div class="image-list-content"></div>'
					].join(""),
					footer: [
						'<button type="button" class="btn btn-default image-list-btn-close">Close</button>'
					].join(""),
					closeOnEscape: true
				};

				self.$dialog = ui.dialog(dialogOption).render().appendTo(container);

				self.$dialog.find(".modal-dialog").addClass("modal-lg");
			};

			this.showDialog = function() {
				return $.Deferred(function(deferred) {
					ui.onDialogShown(self.$dialog, function() {
						context.triggerEvent("dialog.shown");

						// Show the spinner
						self.$dialog.find(".image-list-content").html(imageListOptions.spinnerHtml);

						// Retrieve the data from the endpoint and render the list
						$.get(
							imageListOptions.endpoint,
							null,
							null,
							"json"
						).done(function(data) {
							var content = [];
							var fullUrlPrefix = imageListOptions.fullUrlPrefix;
							var thumbUrlPrefix = imageListOptions.thumbUrlPrefix;

							for (var i = 0; i < data.length; i++) {
								content.push([
									'<div class="col-xs-6 col-sm-4 col-md-3 col-lg-3">',
									'<div class="image-list-item">',
									'<img src="' + thumbUrlPrefix + data[i] + '" data-filename="' + data[i] + '" data-full-url="' + fullUrlPrefix + data[i] + '">',
									'<p>' + data[i] + '</p>',
									'</div>',
									'</div>'
								].join(""));

								if ((i + 1) > 0 && (i + 1) % 2 === 0) content.push('<div class="clearfix visible-xs-block"></div>');
								if ((i + 1) > 0 && (i + 1) % 3 === 0) content.push('<div class="clearfix visible-sm-block"></div>');
								if ((i + 1) > 0 && (i + 1) % 4 === 0) content.push('<div class="clearfix visible-md-block visible-lg-block"></div>');
							}

							self.$dialog.find(".image-list-content").html('<div class="row">' + content.join("") + '</div>');

							self.$dialog.find(".image-list-item").click(function(event) {
								deferred.resolve({
									filename: $(this).children("img").data("filename"),
									fullUrl: $(this).children("img").data("full-url")
								});
							});
						});

						self.$dialog.find(".image-list-btn-close").click(function(event) {
							ui.hideDialog(self.$dialog);
							self.$dialog.remove();
						});
					});

					ui.onDialogHidden(self.$dialog, function() {
						if (deferred.state() === "pending") {
							deferred.reject();
						}
					});

					ui.showDialog(self.$dialog);
				});
			};

			// Insert selected image into the editor
			this.insertImage = function(filename, fullUrl) {
				fullUrl = fullUrl.replace("https:", "").replace("http:", "");
				context.invoke("editor.insertNode", $('<img src="' + fullUrl + '" data-filename="' + filename + '">')[0]);
			};

			// 
			this.show = function() {
				if (!editor.hasClass("fullscreen")) {
					$("html, body").css("overflow", "");
				}

				context.invoke("editor.saveRange");

				self.showDialog()
					.then(function(data) {
						context.invoke("editor.restoreRange");
						self.insertImage(data.filename, data.fullUrl);
						ui.hideDialog(self.$dialog);
					}).fail(function() {
						context.invoke("editor.restoreRange");
				});
			};

			this.initialize = function() {
				var container = options.dialogsInBody ? $("body") : editor;
				self.createDialog(container);
			};

			this.destroy = function() {
				ui.hideDialog(self.$dialog);
				self.$dialog.remove();
			};
		}
	});
}));