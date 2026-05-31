"""
Run from the PCE-Exam/ root while the backend is running:
   python3 seed_tema1.py
"""
import urllib.request, json

questions = [
    # BLOQUE A — Órdenes arquitectónicos
    {"type":"mc","text":"¿Cuál es el orden arquitectónico griego más antiguo?","options":["a) Jónico","b) Corintio","c) Dórico","d) Ático"],"correct_answer":"c"},
    {"type":"mc","text":"¿De qué pueblo procede el orden dórico?","options":["a) Los jonios de Asia Menor","b) Los dorios del Mediterráneo occidental","c) Los corintios del Peloponeso","d) Los macedonios del norte"],"correct_answer":"b"},
    {"type":"mc","text":"La columna dórica, a diferencia de la jónica, carece de:","options":["a) Fuste","b) Capitel","c) Basa","d) Acanaladuras"],"correct_answer":"c"},
    {"type":"mc","text":"¿Cómo se llama la base del templo sobre la que se apoya directamente la columna dórica?","options":["a) Naos","b) Pronaos","c) Estilobato","d) Entablamento"],"correct_answer":"c"},
    {"type":"mc","text":"¿Qué tres piezas componen el capitel dórico?","options":["a) Voluta, toro y escocia","b) Ábaco, equino y collarino","c) Hojas de acanto, ábaco y volutas pequeñas","d) Platabanda, toro y equino"],"correct_answer":"b"},
    {"type":"mc","text":"El entablamento es:","options":["a) La base sobre la que se sustenta la columna","b) La estructura horizontal sobre los capiteles que soporta la cubierta","c) El espacio triangular entre el tejado y el friso","d) El panel decorativo con relieves escultóricos"],"correct_answer":"b"},
    {"type":"mc","text":"¿En qué orden se dividen los elementos del entablamento dórico?","options":["a) Friso, cornisa y arquitrabe","b) Arquitrabe, friso y cornisa","c) Cornisa, arquitrabe y friso","d) Friso, arquitrabe y tímpano"],"correct_answer":"b"},
    {"type":"mc","text":"Las metopas son:","options":["a) Paneles con tres acanaladuras verticales","b) Figuras colocadas en las esquinas del tejado","c) Paneles decorados con relieves escultóricos que alternan con los triglifos","d) Espirales decorativas del capitel jónico"],"correct_answer":"c"},
    {"type":"mc","text":"Los triglifos son:","options":["a) Paneles decorados con relieves escultóricos","b) Paneles con tres acanaladuras verticales","c) Pequeñas figuras en las esquinas del tejado","d) Las tres bandas horizontales del arquitrabe jónico"],"correct_answer":"b"},
    {"type":"mc","text":"¿Cómo se llama el espacio triangular entre el entablamento y la cubierta del templo?","options":["a) Metopa","b) Estilobato","c) Tímpano o frontón","d) Acrótera"],"correct_answer":"c"},
    {"type":"mc","text":"Las acroteras son:","options":["a) Las columnas que rodean el edificio","b) Pequeñas figuras humanas, animales o vegetales colocadas en las esquinas del tejado","c) Los paneles del friso con relieves escultóricos","d) Los elementos cóncavos de la basa jónica"],"correct_answer":"b"},
    {"type":"mc","text":"¿De dónde procede el orden jónico?","options":["a) De Corinto","b) De los dorios del Mediterráneo occidental","c) De las colonias griegas de Asia Menor y las islas Jonias","d) De Esparta"],"correct_answer":"c"},
    {"type":"mc","text":"El elemento más característico y reconocible del capitel jónico son:","options":["a) Las hojas de acanto","b) Las volutas o espirales","c) El collarino y el equino","d) Las metopas"],"correct_answer":"b"},
    {"type":"mc","text":"La basa de la columna jónica está formada por:","options":["a) Ábaco y equino","b) Toro y escocia","c) Voluta y collarino","d) Estilobato y acrótera"],"correct_answer":"b"},
    {"type":"mc","text":"A diferencia del dórico, el friso jónico:","options":["a) Presenta triglifos pero no metopas","b) No existe en este orden","c) Se decora con relieves continuos, sin metopas ni triglifos","d) Se divide en platabandas"],"correct_answer":"c"},
    {"type":"mc","text":"El arquitrabe del orden jónico se divide en tres bandas horizontales llamadas:","options":["a) Metopas","b) Platabandas","c) Escocias","d) Toros"],"correct_answer":"b"},
    {"type":"mc","text":"¿De dónde procede el orden corintio?","options":["a) De las islas Jonias","b) De los dorios del Mediterráneo occidental","c) De Corinto","d) De Alejandría"],"correct_answer":"c"},
    {"type":"mc","text":"El capitel corintio se reconoce porque está decorado con:","options":["a) Grandes volutas a ambos lados","b) Ábaco liso y equino sencillo","c) Hojas de acanto y pequeñas volutas","d) Relieves de escenas mitológicas"],"correct_answer":"c"},
    {"type":"mc","text":"¿Cuál de los tres órdenes genera edificios de mayores dimensiones?","options":["a) Dórico","b) Jónico","c) Corintio","d) Los tres son iguales en dimensiones"],"correct_answer":"c"},
    {"type":"mc","text":"¿Cuál de las siguientes afirmaciones sobre el orden corintio es correcta?","options":["a) Sus columnas no tienen basa, como las dóricas","b) Sus capiteles presentan grandes volutas laterales, como el jónico","c) Conserva la mayor parte de los elementos arquitectónicos del orden jónico","d) Su friso alterna metopas y triglifos como el dórico"],"correct_answer":"c"},
    # BLOQUE B — El templo griego y tipos
    {"type":"mc","text":"¿Para qué función principal estaba concebido el templo griego?","options":["a) Acoger a los fieles durante las celebraciones religiosas masivas","b) Albergar la estatua del dios, guardar tesoros y realizar ritos","c) Servir como residencia de los gobernantes","d) Funcionar como tribunal de justicia"],"correct_answer":"b"},
    {"type":"mc","text":"¿Por qué los griegos daban más importancia al exterior del templo que al interior?","options":["a) Porque el interior era demasiado oscuro para decorarlo","b) Porque las celebraciones multitudinarias se hacían en el exterior","c) Porque el interior estaba reservado exclusivamente a los esclavos","d) Porque el mármol no permitía esculpir el interior"],"correct_answer":"b"},
    {"type":"mc","text":"¿Cuál de estos valores NO forma parte del canon arquitectónico griego?","options":["a) Proporción","b) Grandiosidad colosal","c) Simetría","d) Armonía"],"correct_answer":"b"},
    {"type":"mc","text":"¿Cuál es el material más utilizado en los templos griegos?","options":["a) Granito","b) Piedra caliza","c) Mármol","d) Adobe"],"correct_answer":"c"},
    {"type":"mc","text":"Un templo octástilo tiene:","options":["a) Cuatro columnas en el frente","b) Seis columnas en el frente","c) Ocho columnas en el frente","d) Dos filas de columnas en todos los lados"],"correct_answer":"c"},
    {"type":"mc","text":"Un templo hexástilo tiene:","options":["a) Dos columnas en el frente","b) Cuatro columnas en el frente","c) Seis columnas en el frente","d) Ocho columnas en el frente"],"correct_answer":"c"},
    {"type":"mc","text":"Un templo tetrástilo tiene:","options":["a) Dos columnas","b) Cuatro columnas en el frente","c) Seis columnas en el frente","d) Ocho columnas en el frente"],"correct_answer":"b"},
    {"type":"mc","text":"Un templo períptero es aquel en el que:","options":["a) Solo tiene columnas en el frente","b) Tiene columnas en los dos frentes","c) Las columnas rodean todo el edificio en una sola fila","d) Tiene dos filas de columnas en todos los lados"],"correct_answer":"c"},
    {"type":"mc","text":"Un templo anfipróstilo es aquel que:","options":["a) Solo tiene columnas en el frente","b) Tiene columnas tanto en el frente como en la parte trasera","c) Tiene dos filas de columnas en todos los lados","d) Tiene pilastras en lugar de columnas"],"correct_answer":"b"},
    {"type":"mc","text":"Un templo díptero es aquel que:","options":["a) Solo tiene columnas en el frente","b) Tiene columnas en los dos frentes","c) Las columnas rodean todo el edificio","d) Tiene dos filas de columnas en todos los lados del edificio"],"correct_answer":"d"},
    {"type":"mc","text":"¿Cómo se llama la nave principal del templo griego donde se encuentra la estatua de la divinidad?","options":["a) Pronaos","b) Opistodomo","c) Naos o cella","d) Ágora"],"correct_answer":"c"},
    {"type":"mc","text":"El pronaos es:","options":["a) La estancia reservada a guardar los tesoros del templo","b) El vestíbulo o zaguán que precede a la naos","c) La nave central dedicada a la divinidad","d) La base sobre la que se asienta el templo"],"correct_answer":"b"},
    {"type":"mc","text":"¿Dónde se guardaban los tesoros y objetos litúrgicos del templo griego?","options":["a) En la naos","b) En el pronaos","c) En el opistodomo","d) En el friso"],"correct_answer":"c"},
    {"type":"mc","text":"Un templo in antis es aquel que:","options":["a) Tiene columnas en todos sus lados","b) Tiene la fachada provista de antas (pilastras salientes) con columnas delante","c) No tiene columnas, solo pilastras","d) Tiene dos filas de columnas en el frente"],"correct_answer":"b"},
    {"type":"mc","text":"Un templo próstilo es aquel que:","options":["a) Solo tiene columnas en el frente","b) Tiene columnas en los dos frentes","c) Tiene columnas rodeando todo el edificio","d) Tiene dos filas de columnas en todos los lados"],"correct_answer":"a"},
    # BLOQUE C — Obras arquitectónicas
    {"type":"mc","text":"¿Quiénes fueron los arquitectos del Partenón?","options":["a) Hipodamos y Calícrates","b) Ictino y Calícrates, bajo la supervisión de Fidias","c) Fidias y Mirón","d) Praxíteles e Ictino"],"correct_answer":"b"},
    {"type":"mc","text":"El Partenón pertenece al orden:","options":["a) Jónico","b) Corintio","c) Dórico","d) Compuesto"],"correct_answer":"c"},
    {"type":"mc","text":"¿A qué diosa está dedicado el Partenón?","options":["a) Afrodita","b) Hera","c) Artemisa","d) Atenea"],"correct_answer":"d"},
    {"type":"mc","text":"¿Cuántas columnas tiene el Partenón en su fachada principal?","options":["a) Seis","b) Ocho","c) Diez","d) Doce"],"correct_answer":"b"},
    {"type":"mc","text":"El Partenón es un templo octástilo y:","options":["a) Próstilo","b) Anfipróstilo","c) Períptero","d) Díptero"],"correct_answer":"c"},
    {"type":"mc","text":"¿Dónde se encuentra el Partenón?","options":["a) En la acrópolis de Corinto","b) En la acrópolis de Atenas","c) En la isla de Rodas","d) En Olimpia"],"correct_answer":"b"},
    {"type":"mc","text":"El Erecteón está dedicado a:","options":["a) Atenea y Apolo","b) Poseidón, Atenea y el rey Erecteo","c) Zeus y Hera","d) Artemisa y Hermes"],"correct_answer":"b"},
    {"type":"mc","text":"¿Qué elemento arquitectónico singular hace famoso al Erecteón?","options":["a) Sus columnas corintias de gran tamaño","b) Sus cariátides, columnas con forma de mujer","c) Su tímpano con el combate de los gigantes","d) Su planta circular, única en Grecia"],"correct_answer":"b"},
    {"type":"mc","text":"El Templo de Atenea Niké fue construido por el arquitecto:","options":["a) Ictino","b) Fidias","c) Calícrates","d) Hipodamos"],"correct_answer":"c"},
    {"type":"mc","text":"¿Qué tipo de planta tiene el Templo de Atenea Niké?","options":["a) Octástilo y períptero","b) Anfipróstilo y tetrástilo","c) Hexástilo y díptero","d) Próstilo y dístilo"],"correct_answer":"b"},
    # BLOQUE D — Urbanismo
    {"type":"mc","text":"¿Cómo se denomina la ciudad elevada griega, concebida para la defensa militar?","options":["a) Ágora","b) Stoa","c) Polis","d) Acrópolis"],"correct_answer":"d"},
    {"type":"mc","text":"¿Quién fue el creador del plan hipodámico?","options":["a) Fidias","b) Hipodamos de Mileto","c) Policleto","d) Alejandro Magno"],"correct_answer":"b"},
    {"type":"mc","text":"El trazado hipodámico consiste en:","options":["a) Un sistema de calles curvas adaptadas a la topografía","b) Un diseño radial con una plaza central","c) Un sistema de calles en ángulo recto que genera cuadrículas","d) Calles escalonadas adaptadas a terrenos en pendiente"],"correct_answer":"c"},
    {"type":"mc","text":"¿Cómo se llamaban las calles porticadas griegas que permitían resguardarse del sol y la lluvia?","options":["a) Odeones","b) Stoas","c) Ágoras","d) Acrópolis"],"correct_answer":"b"},
    {"type":"mc","text":"¿Cuál es el teatro griego más conocido mencionado en el temario?","options":["a) Teatro de Atenas","b) Teatro de Olimpia","c) Teatro de Epidauro","d) Teatro de Corinto"],"correct_answer":"c"},
    # BLOQUE E — Escultura arcaica
    {"type":"mc","text":"¿Cuándo comienza el periodo arcaico de la escultura griega?","options":["a) Siglo IV a.C.","b) Siglos VIII-VII a.C.","c) Siglo II a.C.","d) Siglo I a.C."],"correct_answer":"b"},
    {"type":"mc","text":"¿Cuál era la principal influencia que recibía la escultura griega en el periodo arcaico?","options":["a) El arte persa","b) El arte egipcio","c) El arte romano","d) El arte mesopotámico"],"correct_answer":"b"},
    {"type":"mc","text":"Los kouros (o kouroi) son:","options":["a) Templos de pequeñas dimensiones dedicados a héroes","b) Esculturas femeninas con ropajes","c) Atletas masculinos representados desnudos","d) Columnas sin capitel del periodo arcaico"],"correct_answer":"c"},
    {"type":"mc","text":"En la terminología de la escultura griega arcaica, ¿qué representan las korai?","options":["a) Atletas masculinos desnudos","b) Figuras femeninas","c) Héroes con armadura","d) Dioses en postura hierática"],"correct_answer":"b"},
    {"type":"mc","text":"¿Qué es el hieratismo en la escultura arcaica?","options":["a) Una técnica de dorado de superficies","b) La rigidez, frontalidad y falta de expresión de las figuras","c) El uso de mármol blanco importado de Egipto","d) La representación de figuras en pleno movimiento"],"correct_answer":"b"},
    {"type":"mc","text":"¿Cómo se representa el cabello en las esculturas del periodo arcaico?","options":["a) Suelto y naturalista","b) Como trenzas geometrizadas y rizadas","c) Rapado o sin representar","d) Cubierto por un casco"],"correct_answer":"b"},
    {"type":"mc","text":"La sonrisa arcaica es:","options":["a) Una mueca de dolor propia del periodo helenístico","b) Un esbozo de sonrisa sutil característico de las esculturas del periodo arcaico","c) Una técnica de representación de labios del periodo clásico","d) El nombre popular del Auriga de Delfos"],"correct_answer":"b"},
    {"type":"mc","text":"¿Cómo se representan los brazos en los kouros del periodo arcaico?","options":["a) Alzados hacia el cielo","b) Pegados completamente al cuerpo","c) Extendidos hacia los lados","d) Sujetando armas o atributos"],"correct_answer":"b"},
    {"type":"mc","text":"¿Cuál de estas obras pertenece al periodo arcaico?","options":["a) El Discóbolo","b) El Doríforo","c) Cleobis y Bitón","d) El Laocoonte"],"correct_answer":"c"},
    {"type":"mc","text":"¿Cuál de estas obras pertenece al periodo arcaico según el resumen?","options":["a) El Auriga de Delfos","b) El Moscóforo","c) La Venus de Milo","d) El Apoxiomeno"],"correct_answer":"b"},
    {"type":"mc","text":"En el periodo arcaico, algunas figuras presentan una pierna ligeramente adelantada. ¿Qué refleja esto?","options":["a) Una influencia directa del arte romano","b) La búsqueda incipiente de representar el movimiento","c) El canon de las siete cabezas de Policleto","d) La técnica del contraposto ya desarrollada"],"correct_answer":"b"},
    {"type":"mc","text":"¿Cómo se denomina el periodo de transición entre el arcaico y el clásico?","options":["a) Periodo helenístico temprano","b) Periodo arcaico tardío","c) Estilo severo","d) Periodo jónico"],"correct_answer":"c"},
    # BLOQUE F — Escultura clásica
    {"type":"mc","text":"¿Cuál es la obra más conocida del estilo severo (periodo de transición)?","options":["a) El Discóbolo","b) El Auriga de Delfos","c) El Doríforo","d) La Venus de Milo"],"correct_answer":"b"},
    {"type":"mc","text":"¿En qué siglo fue activo Mirón?","options":["a) Siglo VII a.C.","b) Primera mitad del siglo V a.C.","c) Siglo IV a.C.","d) Siglo II a.C."],"correct_answer":"b"},
    {"type":"mc","text":"¿En qué material trabajó principalmente Mirón?","options":["a) Mármol blanco","b) Piedra caliza","c) Bronce","d) Terracota"],"correct_answer":"c"},
    {"type":"mc","text":"¿Cuál es la obra más conocida de Mirón?","options":["a) El Doríforo","b) El Diadúmeno","c) El Discóbolo","d) El Apoxiomeno"],"correct_answer":"c"},
    {"type":"mc","text":"¿Qué representa el Discóbolo de Mirón?","options":["a) Un atleta que porta una lanza","b) Un atleta en el instante anterior a lanzar un disco","c) Un atleta quitándose el sudor y el aceite de la piel","d) Un atleta en reposo después de la competición"],"correct_answer":"b"},
    {"type":"mc","text":"¿Qué vestigio del periodo arcaico conserva el Discóbolo?","options":["a) Los brazos pegados al cuerpo","b) El rostro inexpresivo","c) Las trenzas geometrizadas","d) La postura completamente frontal"],"correct_answer":"b"},
    {"type":"mc","text":"Policleto propuso un canon de proporción conocido como:","options":["a) Las ocho cabezas","b) Las siete cabezas","c) La curva praxiteliana","d) Los paños mojados"],"correct_answer":"b"},
    {"type":"mc","text":"¿En qué consiste el contraposto?","options":["a) Representar la figura completamente de frente con las piernas juntas","b) Apoyar todo el peso del cuerpo en una de las dos piernas, dando movimiento y dinamismo","c) Una técnica para representar los pliegues de la ropa","d) Un canon que mide la proporción en ocho cabezas"],"correct_answer":"b"},
    {"type":"mc","text":"¿Cuál es la obra más conocida de Policleto?","options":["a) El Discóbolo","b) El Doríforo","c) El Hermes de Olimpia","d) El Apoxiomeno"],"correct_answer":"b"},
    {"type":"mc","text":"¿Qué representa el Doríforo de Policleto?","options":["a) Un atleta lanzando un disco","b) Un atleta atándose una cinta en la cabeza","c) Un joven desnudo que porta una lanza","d) Un atleta quitándose el aceite de la piel"],"correct_answer":"c"},
    {"type":"mc","text":"Fidias está especialmente vinculado a las esculturas de:","options":["a) El templo de Zeus en Olimpia","b) El Partenón de Atenas","c) El templo de Apolo en Delfos","d) El altar de Zeus en Pérgamo"],"correct_answer":"b"},
    {"type":"mc","text":"¿Cómo se llama la técnica de Fidias que hace que los tejidos se peguen al cuerpo y queden perfectamente detallados?","options":["a) Curva praxiteliana","b) Contraposto","c) Paños mojados","d) Hieratismo"],"correct_answer":"c"},
    {"type":"mc","text":"¿Con qué apodo se conoce a Fidias?","options":["a) El escultor del movimiento","b) El escultor de atletas","c) El escultor de dioses","d) El escultor de reyes"],"correct_answer":"c"},
    {"type":"mc","text":"¿Qué característica define el estilo de Praxíteles?","options":["a) El canon de las ocho cabezas","b) El contraposto pronunciado que forma la curva praxiteliana","c) Los rostros inexpresivos de tradición arcaica","d) La representación de figuras en bronce"],"correct_answer":"b"},
    {"type":"mc","text":"La curva praxiteliana se produce al:","options":["a) Apoyar el peso en una pierna","b) Doblar notablemente la cadera de las figuras","c) Inclinar la cabeza ligeramente hacia un lado","d) Extender los brazos hacia delante"],"correct_answer":"b"},
    {"type":"mc","text":"¿Cuál de estas obras es de Praxíteles?","options":["a) El Discóbolo","b) El Doríforo","c) El Hermes de Olimpia (Hermes con Dionisos)","d) El Apoxiomeno"],"correct_answer":"c"},
    {"type":"mc","text":"La Afrodita de Cnido de Praxíteles es significativa porque:","options":["a) Es la primera escultura griega en bronce","b) Es el primer desnudo femenino del arte griego","c) Es la primera obra con el canon de las ocho cabezas","d) Es la primera obra que usa el contraposto"],"correct_answer":"b"},
    {"type":"mc","text":"¿Qué canon introdujo Lisipo?","options":["a) Seis cabezas","b) Siete cabezas","c) Ocho cabezas","d) Nueve cabezas"],"correct_answer":"c"},
    {"type":"mc","text":"¿Qué innovación introdujo Lisipo respecto al punto de vista de sus obras?","options":["a) Volvió al punto de vista frontal único del periodo arcaico","b) Sus obras permiten ser observadas desde varios ángulos (360°)","c) Introdujo el relieve en lugar del bulto redondo","d) Hizo obras destinadas exclusivamente a colocarse en alto"],"correct_answer":"b"},
    {"type":"mc","text":"¿Qué representa el Apoxiomeno de Lisipo?","options":["a) Un atleta lanzando un disco","b) Un atleta portando una lanza","c) Un atleta quitándose el sudor y el aceite de la piel","d) Un atleta coronándose con una cinta"],"correct_answer":"c"},
    # BLOQUE G — Escultura helenística
    {"type":"mc","text":"¿Con qué acontecimiento histórico coincide el inicio del periodo helenístico?","options":["a) La fundación de Atenas","b) Las conquistas de Alejandro Magno","c) La Guerra del Peloponeso","d) La invasión persa"],"correct_answer":"b"},
    {"type":"mc","text":"¿Cuál es la tendencia estilística general de la escultura helenística respecto a la clásica?","options":["a) Mayor serenidad y equilibrio","b) Mayor hieratismo y frontalidad","c) Mayor dramatismo, expresividad y tendencia a la grandiosidad","d) Regreso al canon de las siete cabezas de Policleto"],"correct_answer":"c"},
    {"type":"mc","text":"Las tres escuelas de la escultura helenística son:","options":["a) Atenas, Corinto y Esparta","b) Pérgamo, Alejandría y Rodas","c) Mileto, Éfeso y Delos","d) Olimpia, Delfos y Epidauro"],"correct_answer":"b"},
    {"type":"mc","text":"¿A qué escuela helenística pertenece la obra Galo Moribundo (también llamado Gálata moribundo)?","options":["a) Escuela de Rodas","b) Escuela de Alejandría","c) Escuela de Pérgamo","d) Escuela de Atenas"],"correct_answer":"c"},
    {"type":"mc","text":"¿Qué representa la obra Galo Moribundo?","options":["a) La victoria de los dioses sobre los gigantes","b) Una alegoría de las guerras contra la invasión de los galos","c) El dios del río Nilo con sus afluentes","d) El sacerdote Laocoonte y sus hijos"],"correct_answer":"b"},
    {"type":"mc","text":"¿A qué escuela helenística pertenece el Laocoonte?","options":["a) Escuela de Pérgamo","b) Escuela de Alejandría","c) Escuela de Rodas","d) Escuela de Corinto"],"correct_answer":"c"},
    {"type":"mc","text":"¿A qué escuela helenística pertenece la Victoria de Samotracia?","options":["a) Escuela de Pérgamo","b) Escuela de Alejandría","c) Escuela de Rodas","d) Escuela de Atenas"],"correct_answer":"c"},
    {"type":"mc","text":"¿Qué característica destacada tiene la Victoria de Samotracia?","options":["a) El realismo de los defectos físicos y la vejez","b) La riqueza de detalles realistas en los pliegues de la ropa agitados por el viento","c) La representación de un dios egipcio como dios griego","d) La extrema serenidad y equilibrio típicamente clásicos"],"correct_answer":"b"},
    {"type":"mc","text":"La obra El Nilo pertenece a la escuela de:","options":["a) Pérgamo","b) Rodas","c) Alejandría","d) Corinto"],"correct_answer":"c"},
    {"type":"mc","text":"¿Qué representa la obra El Nilo de la escuela de Alejandría?","options":["a) Al dios del mar en postura triunfal","b) Al dios egipcio del río Nilo representado como un dios griego, con alegorías de sus afluentes","c) Al dios Alejandro Magno conquistando Egipto","d) Una personificación femenina del delta del Nilo"],"correct_answer":"b"},
    {"type":"mc","text":"La Venus de Milo se considera:","options":["a) Una obra puramente helenística sin influencias clásicas","b) Una obra que muestra reminiscencias del periodo clásico dentro de la época helenística","c) La obra más representativa del hieratismo arcaico","d) Una obra de la escuela de Pérgamo"],"correct_answer":"b"},
    {"type":"mc","text":"¿Qué elemento de la Venus de Milo evoca el estilo clásico?","options":["a) El dramatismo extremo de su expresión","b) La representación detallada de sus defectos físicos","c) La curvatura de su torso que evoca la curva praxiteliana","d) La postura completamente frontal sin movimiento"],"correct_answer":"c"},
    {"type":"mc","text":"¿Cuáles son las características generales de la escultura helenística que la diferencian de la clásica?","options":["a) Hieratismo, frontalidad y falta de expresión","b) Escenas violentas, posturas complicadas, cuerpos retorcidos y rostros con dramatismo","c) Serenidad, equilibrio y proporción ideal","d) Influencia exclusiva del arte egipcio"],"correct_answer":"b"},
    # BLOQUE H — Preguntas mixtas
    {"type":"mc","text":"¿Cuál de los siguientes pares obra-escultor es INCORRECTO?","options":["a) Discóbolo — Mirón","b) Doríforo — Policleto","c) Hermes de Olimpia — Fidias","d) Apoxiomeno — Lisipo"],"correct_answer":"c"},
    {"type":"mc","text":"¿Qué orden cronológico correcto tienen los tres periodos de la escultura griega?","options":["a) Clásico → Arcaico → Helenístico","b) Helenístico → Clásico → Arcaico","c) Arcaico → Clásico → Helenístico","d) Arcaico → Helenístico → Clásico"],"correct_answer":"c"},
    {"type":"mc","text":"¿Cuál de los siguientes edificios está en la Acrópolis de Atenas?","options":["a) El altar de Zeus en Pérgamo","b) El teatro de Epidauro","c) El Partenón","d) El templo de Zeus en Olimpia"],"correct_answer":"c"},
    {"type":"mc","text":"¿Cuál de los siguientes órdenes NO presenta volutas en su capitel?","options":["a) Jónico","b) Corintio (volutas pequeñas)","c) Dórico","d) Tanto jónico como corintio las tienen"],"correct_answer":"c"},
    {"type":"mc","text":"La evolución de la escultura griega sigue una trayectoria de:","options":["a) Del dinamismo helenístico al hieratismo arcaico","b) Del hieratismo arcaico a la idealización clásica y el expresionismo helenístico","c) De la perfección clásica al hieratismo arcaico","d) Del naturalismo helenístico a la abstracción clásica"],"correct_answer":"b"},
]

exam = {
    "topic": "Historia del Arte",
    "title": "Arte Griego — Test Definitivo (100 preguntas)",
    "source_text": open("ai-ready/contents/art-history/test-tema-1-arte-griego.md").read(),
    "questions": questions
}

data = json.dumps(exam).encode()
req = urllib.request.Request(
    "http://localhost:8001/exams/create",
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST"
)

with urllib.request.urlopen(req) as res:
    result = json.loads(res.read())
    print(f"Examen creado con ID: {result['id']}")
    print(f"Titulo: {result['title']}")
    print(f"Preguntas: {len(result['questions'])}")
