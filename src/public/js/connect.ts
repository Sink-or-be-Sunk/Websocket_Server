$(function () {
    $("#search").on("keyup", function () {
        const value = $(this).val.toString().toLowerCase();
        $("#devices *").filter(function () {
            const txt = $(this).text();
            const val = txt.toLowerCase();
            const res = val.indexOf(value) > -1;
            console.log("inside", txt, val, res);
            console.log(value)
            return res;
        })
    })
})