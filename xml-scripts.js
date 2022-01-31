function xmlToObject(xml) {

    var objeto = {};
    var esRaiz = false;

    //  Objeto "raiz"
    if (xml.nodeType == 1) { // Objeto 
        // Se recuperan sus atributos
        if (xml.attributes.length > 0) {
            for (var j = 0; j < xml.attributes.length; j++) {
                var atributo = xml.attributes.item(j);
                objeto[atributo.nodeName] = atributo.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // Texto
        objeto = xml.nodeValue;
    } else if (xml.nodeType == 9) { // Elemento raiz
        esRaiz = true;
    }

    // Atributos del objeto (objetos hijos)
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nombreNodo = item.nodeName;

            // Si objeto no tiene un atributo con el nombre nombreNodo se anade, si ya lo tiene (es un array) se anade
            // a la lista del objeto con nombre nombreNodo
            if (typeof (objeto[nombreNodo]) == "undefined") {
                // Si el elemento es un CDATA se copia el contenido en el elemento y no se crea un
                // hijo para almacenar el texto
                if (nombreNodo == "#cdata-section") {
                    objeto = item.nodeValue;
                } else if (nombreNodo == "#text") { // Si el elemento es un texto no se crea el objeto #text
                    if (item.childNodes.length < 1) {
                        objeto = item.nodeValue;
                    } else {
                        objeto[nombreNodo] = xmlToObject(item);
                    }
                } else {
                    if (esRaiz) {
                        objeto = xmlToObject(item);
                    } else {
                        objeto[nombreNodo] = xmlToObject(item);
                    }
                }
            } else {
                // Si el atributo no es una lista se convierte el atributo en un array y se anade el
                // valor a dicho array
                if (typeof (objeto[nombreNodo].push) == "undefined") {
                    var valorAtributo = objeto[nombreNodo];
                    objeto[nombreNodo] = new Array();
                    objeto[nombreNodo].push(valorAtributo);
                }

                objeto[nombreNodo].push(xmlToObject(item));
            }
        }
    }

    return objeto;
}

$.when($.ready).then(function () {

    /*modify select properties */
    $("option").addClass("bg-white");
    $("option").addClass("text-dark");

    /* Some modifications */
    $('.quote-prev, .quote-next').css('opacity', '0');
    $('.carousel-control-prev, .carousel-control-next').css('text-decoration', 'none');
    $('.quote-prev, .quote-next').mouseenter(function () {
        $(this).css('opacity', '1')
    });

    $('.quote-prev, .quote-next').mouseleave(function () {
        $(this).css('opacity', '0');
    });

    $('.loader').css('margin', '3.4rem');

    $(".card-body .video-rated .rating-stars .star").css("color", "#BBB");

    function getCourses(q = "", topic = "", sort = "") {

        $("#c-quantity").text("");
        $("#coursesRow").addClass("d-none");
        $("#coursesLoader").addClass("d-flex");
        $("#coursesLoader").removeClass("d-none");

        /* Get Courses by filter */
        $.ajax({
            url: `https://smileschool-api.hbtn.info/xml/courses?&q=${q.toLowerCase()}&topic=${topic}&sort=${sort}`,
            type: "GET",
            contentType: 'application/json',
            success: function (response) {
                let i = 1;

                const jsonObject = xmlToObject(response);
                const courses = jsonObject.courses;
                const t_courses = courses.course.length


                // clean all cards and properties for new filter
                $(`.videos-row .row .course`).addClass("d-none");
                $(`.videos-row .row .course .card-img-top`).attr("src", "");
                $(`.videos-row .row .course .card-body .card-title`).text("");
                $(`.videos-row .row .course .card-body .card-text`).text("");
                $(`.videos-row .row .course .card-body .author img`).text("");
                $(`.videos-row .row .course .card-body .author h5`).text("");
                $(`.videos-row .row .course .card-body .video-rated .rating-stars .star`).removeClass("text-primary");
                $(`.videos-row .row .course .card-body .video-rated .rating-time p`).text("");

                // add courses quantity
                if (t_courses > 1) $("#c-quantity").text(`${t_courses} videos`);
                else if (t_courses === 1) $("#c-quantity").text(`${t_courses} video`);

                // add cards contain properties
                for (let course of courses.course) {
                    $(`.videos-row .row .course:nth-child(${i})`).removeClass("d-none");
                    $(`.videos-row .row .course:nth-child(${i}) .card-img-top`).attr("src", course.thumb_url);
                    $(`.videos-row .row .course:nth-child(${i}) .card-body .card-title`).text(course.title);
                    $(`.videos-row .row .course:nth-child(${i}) .card-body .card-text`).text(course["sub-title"]);
                    $(`.videos-row .row .course:nth-child(${i}) .card-body .author img`).attr("src", course.author_pic_url);
                    $(`.videos-row .row .course:nth-child(${i}) .card-body .author h5`).text(course.author);
                    for (let j = 1; j <= course.star; j++) {
                        $(`.videos-row .row .course:nth-child(${i}) .card-body .video-rated .rating-stars .star:nth-child(${j})`).addClass("text-primary");
                    }
                    $(`.videos-row .row course:nth-child(${i}) .card-body .video-rated .rating-time p`).text(course.duration);

                    i++;
                }

                $("#coursesLoader").removeClass("d-flex");
                $("#coursesLoader").addClass("d-none");
                $("#coursesRow").removeClass("d-none");


            },
            error: function (error) {
                alert("Can read courses hbtn API\n" + error.message);
            },
        });

    }

    /* Get quotes information */
    $.ajax({
        url: "https://smileschool-api.hbtn.info/xml/quotes",
        type: "GET",
        contentType: 'application/json',
        success: function (response) {

            const jsonObject = xmlToObject(response);
            const quotes = jsonObject.quote;

            const quote1 = quotes[0];
            const quote2 = quotes[1];

            $('#q1 div img').attr("src", quote1.pic_url);
            $('#q2 div img').attr("src", quote2.pic_url);

            $('#q1 div blockquote p').first().text(quote1.text);
            $('#q2 div blockquote p').first().text(quote2.text);

            $("#q1 div blockquote p:nth-child(2)").text(quote1.name);
            $("#q2 div blockquote p:nth-child(2)").text(quote2.name);

            $("#q1 div blockquote p:nth-child(3)").text(quote1.title);
            $("#q2 div blockquote p:nth-child(3)").text(quote2.title);

            $("#quotesLoader").removeClass("d-flex");
            $("#quotesLoader").addClass("d-none");
            $("#quotesCarousel").removeClass("d-none");
        },
        error: function (error) {
            alert("Can read hbtn API\n" + error);
        },
    });

    /* Get tutorials videos information */
    $.ajax({
        url: "https://smileschool-api.hbtn.info/xml/popular-tutorials",
        type: "GET",
        contentType: 'application/json',
        success: function (response) {

            const jsonObject = xmlToObject(response);
            const videos = jsonObject.video;

            const t_card1 = videos[0];
            const t_card2 = videos[1];
            const t_card3 = videos[2];
            const t_card4 = videos[3];
            const t_card5 = videos[4];
            const t_card6 = videos[5];
            const t_card7 = videos[6];

            $('#tc-1 .card-img-top').attr("src", t_card1.thumb_url);
            $('#tc-2 .card-img-top').attr("src", t_card2.thumb_url);
            $('#tc-3 .card-img-top').attr("src", t_card3.thumb_url);
            $('#tc-4 .card-img-top').attr("src", t_card4.thumb_url);
            $('#tc-5 .card-img-top').attr("src", t_card5.thumb_url);
            $('#tc-6 .card-img-top').attr("src", t_card6.thumb_url);
            $('#tc-7 .card-img-top').attr("src", t_card7.thumb_url);

            $('#tc-1 div h5').text(t_card1.title);
            $('#tc-2 div h5').text(t_card2.title);
            $('#tc-3 div h5').text(t_card3.title);
            $('#tc-4 div h5').text(t_card4.title);
            $('#tc-5 div h5').text(t_card5.title);
            $('#tc-6 div h5').text(t_card6.title);
            $('#tc-7 div h5').text(t_card7.title);

            $('#tc-1 div .card-text').text(t_card1["sub-title"]);
            $('#tc-2 div .card-text').text(t_card2["sub-title"]);
            $('#tc-3 div .card-text').text(t_card3["sub-title"]);
            $('#tc-4 div .card-text').text(t_card4["sub-title"]);
            $('#tc-5 div .card-text').text(t_card5["sub-title"]);
            $('#tc-6 div .card-text').text(t_card6["sub-title"]);
            $('#tc-7 div .card-text').text(t_card7["sub-title"]);

            $('#tc-1 .card-body .author img').attr("src", t_card1.author_pic_url);
            $('#tc-2 .card-body .author img').attr("src", t_card2.author_pic_url);
            $('#tc-3 .card-body .author img').attr("src", t_card3.author_pic_url);
            $('#tc-4 .card-body .author img').attr("src", t_card4.author_pic_url);
            $('#tc-5 .card-body .author img').attr("src", t_card5.author_pic_url);
            $('#tc-6 .card-body .author img').attr("src", t_card6.author_pic_url);
            $('#tc-7 .card-body .author img').attr("src", t_card7.author_pic_url);

            $('#tc-1 .card-body .author h6').text(t_card1.author);
            $('#tc-2 .card-body .author h6').text(t_card2.author);
            $('#tc-3 .card-body .author h6').text(t_card3.author);
            $('#tc-4 .card-body .author h6').text(t_card4.author);
            $('#tc-5 .card-body .author h6').text(t_card5.author);
            $('#tc-6 .card-body .author h6').text(t_card6.author);
            $('#tc-7 .card-body .author h6').text(t_card7.author);

            $('#tc-1 .card-body .video-rated .rating-time p').text(t_card1.duration);
            $('#tc-2 .card-body .video-rated .rating-time p').text(t_card2.duration);
            $('#tc-3 .card-body .video-rated .rating-time p').text(t_card3.duration);
            $('#tc-4 .card-body .video-rated .rating-time p').text(t_card4.duration);
            $('#tc-5 .card-body .video-rated .rating-time p').text(t_card5.duration);
            $('#tc-6 .card-body .video-rated .rating-time p').text(t_card6.duration);
            $('#tc-7 .card-body .video-rated .rating-time p').text(t_card7.duration);

            for (let i = 1; i <= t_card1.star; i++) {
                $(`#tc-1 .card-body .video-rated .rating-stars .star:nth-child(${i})`).addClass("text-primary");
            }
            for (let i = 1; i <= t_card2.star; i++) {
                $(`#tc-2 .card-body .video-rated .rating-stars .star:nth-child(${i})`).addClass("text-primary");
            }
            for (let i = 1; i <= t_card3.star; i++) {
                $(`#tc-3 .card-body .video-rated .rating-stars .star:nth-child(${i})`).addClass("text-primary");
            }
            for (let i = 1; i <= t_card4.star; i++) {
                $(`#tc-4 .card-body .video-rated .rating-stars .star:nth-child(${i})`).addClass("text-primary");
            }
            for (let i = 1; i <= t_card5.star; i++) {
                $(`#tc-5 .card-body .video-rated .rating-stars .star:nth-child(${i})`).addClass("text-primary");
            }
            for (let i = 1; i <= t_card6.star; i++) {
                $(`#tc-6 .card-body .video-rated .rating-stars .star:nth-child(${i})`).addClass("text-primary");
            }
            for (let i = 1; i <= t_card7.star; i++) {
                $(`#tc-7 .card-body .video-rated .rating-stars .star:nth-child(${i})`).addClass("text-primary");
            }
            $("#tutorialLoader").addClass("d-none");
            $("#tutorialCarousel").removeClass("d-none");
        },
        error: function (error) {
            alert("Can read tutorial videos hbtn API\n" + error);
        },
    });

    /* Get lastest videos information */
    $.ajax({
        url: "https://smileschool-api.hbtn.info/xml/latest-videos",
        type: "GET",
        contentType: 'application/json',
        success: function (response) {

            const jsonObject = xmlToObject(response);
            const videos = jsonObject.video;

            const l_card1 = videos[0];
            const l_card2 = videos[1];
            const l_card3 = videos[2];
            const l_card4 = videos[3];

            $('#lc-1 .card-img-top').attr("src", l_card1.thumb_url);
            $('#lc-2 .card-img-top').attr("src", l_card2.thumb_url);
            $('#lc-3 .card-img-top').attr("src", l_card3.thumb_url);
            $('#lc-4 .card-img-top').attr("src", l_card4.thumb_url);

            $('#lc-1 div h5').text(l_card1.title);
            $('#lc-2 div h5').text(l_card2.title);
            $('#lc-3 div h5').text(l_card3.title);
            $('#lc-4 div h5').text(l_card4.title);

            $('#lc-1 div .card-text').text(l_card1["sub-title"]);
            $('#lc-2 div .card-text').text(l_card2["sub-title"]);
            $('#lc-3 div .card-text').text(l_card3["sub-title"]);
            $('#lc-4 div .card-text').text(l_card4["sub-title"]);

            $('#lc-1 .card-body .author img').attr("src", l_card1.author_pic_url);
            $('#lc-2 .card-body .author img').attr("src", l_card2.author_pic_url);
            $('#lc-3 .card-body .author img').attr("src", l_card3.author_pic_url);
            $('#lc-4 .card-body .author img').attr("src", l_card4.author_pic_url);

            $('#lc-1 .card-body .author h6').text(l_card1.author);
            $('#lc-2 .card-body .author h6').text(l_card2.author);
            $('#lc-3 .card-body .author h6').text(l_card3.author);
            $('#lc-4 .card-body .author h6').text(l_card4.author);

            $('#lc-1 .card-body .video-rated .rating-time p').text(l_card1.duration);
            $('#lc-2 .card-body .video-rated .rating-time p').text(l_card2.duration);
            $('#lc-3 .card-body .video-rated .rating-time p').text(l_card3.duration);
            $('#lc-4 .card-body .video-rated .rating-time p').text(l_card4.duration);

            for (let i = 1; i <= l_card1.star; i++) {
                $(`#lc-1 .card-body .video-rated .rating-stars .star:nth-child(${i})`).addClass("text-primary");
            }
            for (let i = 1; i <= l_card2.star; i++) {
                $(`#lc-2 .card-body .video-rated .rating-stars .star:nth-child(${i})`).addClass("text-primary");
            }
            for (let i = 1; i <= l_card3.star; i++) {
                $(`#lc-3 .card-body .video-rated .rating-stars .star:nth-child(${i})`).addClass("text-primary");
            }
            for (let i = 1; i <= l_card4.star; i++) {
                $(`#lc-4 .card-body .video-rated .rating-stars .star:nth-child(${i})`).addClass("text-primary");
            }

            $("#lastestLoader").addClass("d-none");
            $("#lastestCarousel").removeClass("d-none");
        },
        error: function (error) {
            alert("Can read lastest videos hbtn API\n" + error);
        },
    });

    /* slide card by card in carousel */
    let items = document.querySelectorAll('.carousel .car-tut')

    items.forEach((el) => {
        const minPerSlide = 4
        let next = el.nextElementSibling
        for (var i = 1; i < minPerSlide; i++) {
            if (!next) {
                // wrap carousel by using first child
                next = items[0]
            }
            let cloneChild = next.cloneNode(true)
            el.appendChild(cloneChild.children[0])
            next = next.nextElementSibling
        }
    });


    getCourses("", $("#topic").val(), $("#sort-by").val());

    $("#keywords").change(function () {
        getCourses($("#keywords").val(), $("#topic").val(), $("#sort-by").val());
    });

    $("#topic").change(function () {
        $("#topic option:selected").each(function () {
            getCourses($("#keywords").val(), $("#topic").val(), $("#sort-by").val());
        });
    });

    $("#sort-by").change(function () {
        $("#sort-by option:selected").each(function () {
            getCourses($("#keywords").val(), $("#topic").val(), $("#sort-by").val());
        });
    });

});



jQuery.readyException = function (error) {
    console.error("jQuery has not been loaded correctly");
};
