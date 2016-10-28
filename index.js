/**
 * yamvish twopass rendering middleware
 */
var fs = require('fs'),
	path = require('path'),
	pretty = require('pretty');

module.exports = function(yamapp, basePath, prettyOutput) {
	var y = yamapp.y,
		indexFile = fs.readFileSync(path.join(basePath, yamapp.index || './index.html'), 'utf8'),
		indexTemplate = y.html.parse(indexFile, 'document');

	if (!indexTemplate)
		throw new Error('index template parsing failed : ' + indexTemplate);

	return function(req, res, next) {
		if (req.url.match(/^\/statics|^\/api/))
			return next();
		var ctx = yamapp.context.clone(true);
		if (yamapp.y.router)
			ctx.data.$route = y.router.parseURL(req.url);
		try {
			indexTemplate.twopass(ctx)
				.then(function(s) {
					res.send(prettyOutput ? pretty('<!DOCTYPE html>' + s) : '<!DOCTYPE html>' + s);
					res.end();
				})
				.catch(function(e) {
					// console.trace('yamvish middleware error (2) : ', e);
					next(e);
				});
		} catch (e) {
			console.trace('yamvish middleware error (1) : ', e);
			next(e);
		}
	};
};