var page = require('webpage').create();
page.settings = {
    javascriptEnabled: true,
    loadImages: false,
    Cookie: "xq_a_token=a365d23ab715f9c3b963dc268149f35031ddb8c1",
    userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.31 (KHTML, like Gecko) PhantomJS/19.0'
};
page.open('https://xueqiu.com/follows', function(status) {
    console.log("Status: " + status);
    if(status === "success") {
        page.render('example.png');
    }

    var title = page.evaluate(function() {
        return document.body;
    });
    console.log('Page title is ' + title);
    phantom.exit();
});
