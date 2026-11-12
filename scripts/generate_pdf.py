"""
Generador nativo de PDF en Python puro sin dependencias externas.
Construye el documento PDF con especificación PDF 1.4 estricta.
"""
import sys
import os

class SimplePDF:
    def __init__(self, filename):
        self.filename = filename
        self.objects = []
        self.pages = []
        self.current_page_stream = []
        self.y = 750
        self.page_width = 612
        self.page_height = 792
        self.left_margin = 45
        self.right_margin = 567

    def add_page(self):
        if self.current_page_stream:
            self.pages.append("".join(self.current_page_stream))
            self.current_page_stream = []
        self.y = 740

    def draw_text(self, text, x, y, size=10, font="F1", r=0.1, g=0.1, b=0.1):
        clean_text = text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
        # Reemplazar caracteres especiales fuera de WinAnsi / Latin-1 a equivalentes legibles
        replacements = {
            'á': '\\341', 'é': '\\351', 'í': '\\355', 'ó': '\\363', 'ú': '\\372',
            'Á': '\\301', 'É': '\\311', 'Í': '\\315', 'Ó': '\\323', 'Ú': '\\332',
            'ñ': '\\361', 'Ñ': '\\321', 'ü': '\\374', 'Ü': '\\334', '¿': '\\277',
            '¡': '\\241', '•': '-', '—': '-', '–': '-', '”': '"', '“': '"',
            '’': "'", '‘': "'", 'Δ': 'D', 'Σ': 'Sum', '≤': '<=', '≥': '>='
        }
        for k, v in replacements.items():
            clean_text = clean_text.replace(k, v)
        stream_cmd = f"BT /{font} {size} Tf {r:.2f} {g:.2f} {b:.2f} rg {x:.1f} {y:.1f} Td ({clean_text}) Tj ET\n"
        self.current_page_stream.append(stream_cmd)

    def draw_rect(self, x, y, w, h, fill_r=0.95, fill_g=0.95, fill_b=0.95, stroke_r=0.8, stroke_g=0.8, stroke_b=0.8):
        cmd = f"{fill_r:.2f} {fill_g:.2f} {fill_b:.2f} rg {stroke_r:.2f} {stroke_g:.2f} {stroke_b:.2f} RG {x:.1f} {y:.1f} {w:.1f} {h:.1f} re B\n"
        self.current_page_stream.append(cmd)

    def draw_line(self, x1, y1, x2, y2, r=0.8, g=0.8, b=0.8, width=1):
        cmd = f"{width} w {r:.2f} {g:.2f} {b:.2f} RG {x1:.1f} {y1:.1f} m {x2:.1f} {y2:.1f} l S\n"
        self.current_page_stream.append(cmd)

    def check_space(self, needed):
        if self.y - needed < 50:
            self.add_page()

    def add_header(self, tag, title, subtitle):
        self.draw_rect(45, self.y - 10, 522, 50, 0.94, 0.97, 1.0, 0.2, 0.4, 0.9)
        self.draw_text(tag, 55, self.y + 24, size=8, font="F2", r=0.1, g=0.3, b=0.8)
        self.draw_text(title, 55, self.y + 8, size=15, font="F2", r=0.05, g=0.1, b=0.2)
        self.draw_text(subtitle, 55, self.y - 5, size=9, font="F1", r=0.3, g=0.4, b=0.5)
        self.y -= 35

    def add_section(self, title):
        self.check_space(45)
        self.y -= 15
        self.draw_rect(45, self.y - 4, 522, 22, 0.95, 0.97, 0.99, 0.85, 0.9, 0.95)
        self.draw_line(45, self.y - 4, 45, self.y + 18, r=0.15, g=0.4, b=0.9, width=4)
        self.draw_text(title, 55, self.y + 2, size=11, font="F2", r=0.1, g=0.2, b=0.6)
        self.y -= 14

    def add_paragraph(self, text, size=9.5, font="F1", r=0.15, g=0.2, b=0.25):
        words = text.split(" ")
        line = ""
        for w in words:
            if len(line) + len(w) + 1 > 95:
                self.check_space(14)
                self.draw_text(line, 45, self.y, size=size, font=font, r=r, g=g, b=b)
                self.y -= 13
                line = w
            else:
                line = f"{line} {w}".strip()
        if line:
            self.check_space(14)
            self.draw_text(line, 45, self.y, size=size, font=font, r=r, g=g, b=b)
            self.y -= 13

    def add_box(self, title, lines, r_bg=0.97, g_bg=0.98, b_bg=0.99, r_bd=0.2, g_bd=0.7, b_bd=0.5):
        needed = 24 + len(lines) * 14
        self.check_space(needed)
        self.y -= 8
        box_y = self.y - (needed - 12)
        self.draw_rect(45, box_y, 522, needed, r_bg, g_bg, b_bg, 0.85, 0.9, 0.9)
        self.draw_line(45, box_y, 45, box_y + needed, r=r_bd, g=g_bd, b=b_bd, width=4)
        self.draw_text(title, 55, self.y + 2, size=9.5, font="F2", r=0.05, g=0.3, b=0.2)
        curr_y = self.y - 12
        for l in lines:
            self.draw_text(l, 55, curr_y, size=8.5, font="F1", r=0.1, g=0.2, b=0.3)
            curr_y -= 13
        self.y = box_y - 10

    def add_table_row(self, col1, col2, col3, is_header=False):
        self.check_space(26)
        bg = (0.9, 0.93, 0.98) if is_header else (0.98, 0.99, 1.0)
        self.draw_rect(45, self.y - 4, 522, 22, bg[0], bg[1], bg[2], 0.8, 0.85, 0.9)
        f = "F2" if is_header else "F1"
        s = 8.5 if not is_header else 8.5
        tc = (0.05, 0.2, 0.5) if is_header else (0.1, 0.15, 0.2)
        self.draw_text(col1[:28], 50, self.y + 2, size=s, font="F2" if not is_header else f, r=tc[0], g=tc[1], b=tc[2])
        self.draw_text(col2[:42], 175, self.y + 2, size=s, font=f, r=tc[0], g=tc[1], b=tc[2])
        self.draw_text(col3[:48], 360, self.y + 2, size=s, font=f, r=tc[0], g=tc[1], b=tc[2])
        self.y -= 22

    def save(self):
        if self.current_page_stream:
            self.pages.append("".join(self.current_page_stream))

        out = []
        out.append("%PDF-1.4\n")

        # Obj 1: Catalog
        out.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
        
        # Obj 2: Pages
        page_objs_refs = " ".join([f"{3 + i*2} 0 R" for i in range(len(self.pages))])
        out.append(f"2 0 obj\n<< /Type /Pages /Kids [{page_objs_refs}] /Count {len(self.pages)} >>\nendobj\n")

        # Fonts Obj
        font1_idx = 3 + len(self.pages) * 2
        font2_idx = font1_idx + 1

        for i, page_data in enumerate(self.pages):
            page_obj_idx = 3 + i * 2
            content_obj_idx = page_obj_idx + 1
            out.append(f"{page_obj_idx} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents {content_obj_idx} 0 R /Resources << /Font << /F1 {font1_idx} 0 R /F2 {font2_idx} 0 R >> >> >>\nendobj\n")
            
            content_bytes = page_data.encode('latin1')
            out.append(f"{content_obj_idx} 0 obj\n<< /Length {len(content_bytes)} >>\nstream\n")
            out.append(page_data)
            out.append("\nendstream\nendobj\n")

        # Font 1: Helvetica (Regular)
        out.append(f"{font1_idx} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n")
        # Font 2: Helvetica-Bold
        out.append(f"{font2_idx} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n")

        # XRef table
        xref_start = sum(len(x.encode('latin1')) for x in out)
        total_objs = font2_idx + 1
        out.append("xref\n")
        out.append(f"0 {total_objs}\n")
        out.append("0000000000 65535 f \n")

        # Calculate offsets
        offset = len("%PDF-1.4\n".encode('latin1'))
        offsets = [offset]

        # Catalog
        cat_len = len("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n".encode('latin1'))
        offsets.append(offsets[-1] + cat_len)

        # Pages
        pages_len = len(f"2 0 obj\n<< /Type /Pages /Kids [{page_objs_refs}] /Count {len(self.pages)} >>\nendobj\n".encode('latin1'))
        offsets.append(offsets[-1] + pages_len)

        for i, page_data in enumerate(self.pages):
            page_obj_idx = 3 + i * 2
            content_obj_idx = page_obj_idx + 1
            p_len = len(f"{page_obj_idx} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents {content_obj_idx} 0 R /Resources << /Font << /F1 {font1_idx} 0 R /F2 {font2_idx} 0 R >> >> >>\nendobj\n".encode('latin1'))
            offsets.append(offsets[-1] + p_len)
            c_len = len(f"{content_obj_idx} 0 obj\n<< /Length {len(page_data.encode('latin1'))} >>\nstream\n{page_data}\nendstream\nendobj\n".encode('latin1'))
            offsets.append(offsets[-1] + c_len)

        # Font 1
        f1_len = len(f"{font1_idx} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n".encode('latin1'))
        offsets.append(offsets[-1] + f1_len)

        # Print xref offsets
        xref_lines = []
        for o in offsets[:-1]:
            xref_lines.append(f"{o:010d} 00000 n \n")

        out.append("".join(xref_lines))
        out.append(f"trailer\n<< /Size {total_objs} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n")

        with open(self.filename, 'wb') as f:
            f.write("".join(out).encode('latin1'))
        print(f"PDF generado exitosamente: {self.filename}")

def build_guide():
    pdf = SimplePDF("GUIA_DEFENSA_SISTEMA_FINANCIERO.pdf")

    # ========================== PÁGINA 1 ==========================
    pdf.add_header(
        "GFO - IS2122 | INGENIERIA EN SISTEMAS",
        "Guia Maestra de Defensa y Arquitectura Financiera",
        "Ecosistema Reactivo de Analisis, Planeacion y Decision Financiera (Modulos A al I)"
    )

    pdf.add_section("1. Vision Global: Que es el Sistema y como opera?")
    pdf.add_paragraph(
        "El software no es una simple hoja de calculo ni una base de datos estatica: es un Ecosistema Financiero Integral en Cascada (Modulos A al I). Cada modulo cumple una funcion canonica de la administracion financiera moderna bajo principios internacionales (NIC 1, NIC 2, NIC 7 y NIIF), y todos los datos fluyen de forma continua y automatizada en memoria reactiva sin necesidad de sincronizaciones manuales."
    )

    pdf.add_box(
        "ARQUITECTURA DE FLUJO EN CASCADA (A -> I)",
        [
            "[1. Entrada y Nucleo Contable] -> Modulo A (Balance General y Resultados Comparativo)",
            "  |--> [2. Diagnostico Financiero] -> Modulo B (Vertical, Horizontal, 14 Ratios, DuPont)",
            "  |--> [3. Estructura de Costos]  -> Modulo C (Punto de Equilibrio C-V-U) y Modulo D (GAO, GAF, GAT)",
            "  |--> [4. Planeacion y Liquidez] -> Modulo E (Flujo NIC 7), Modulo F (Presupuesto) y Modulo G (Proforma AFN)",
            "  +--> [5. Operaciones y Control] -> Modulo I (Inventarios NIC 2) <---> (Sincroniza Cuenta 1107 en Modulo A)"
        ],
        0.95, 0.97, 1.0, 0.2, 0.4, 0.9
    )

    pdf.add_section("2. Mapa de Conexion: De donde salen y a donde van los datos?")
    pdf.add_table_row("Modulo", "Origen de Datos", "Destino e Impacto", is_header=True)
    pdf.add_table_row("Modulo A: Estados", "Documento subido (PDF, Excel, CSV) o saldos", "Alimenta el corazon: B, C, D, E, F y G")
    pdf.add_table_row("Modulo B: Diagnostico", "Catálogo y totales consolidados de A", "Genera dictamen y ratios de viabilidad a G")
    pdf.add_table_row("Modulo C: Equilibrio", "Ventas, Costos y Gastos Fijos de A", "Define el piso minimo para metas de F y G")
    pdf.add_table_row("Modulo D: Apalancamiento", "UAII, Gastos Financieros y CF de A y C", "Mide el riesgo y volatilidad del Proforma")
    pdf.add_table_row("Modulo E: Flujo NIC 7", "Utilidad Neta de A, Depreciacion y Capital Trabajo", "Audita si la caja de A es real o por deuda")
    pdf.add_table_row("Modulo F: Presupuesto", "Cierre de ventas, inventario y metas anuales", "Crea las cedulas base para el Proforma G")
    pdf.add_table_row("Modulo G: Proforma AFN", "Datos de A combinados con Presupuesto F", "Calcula la necesidad de credito bancario")
    pdf.add_table_row("Modulo I: Inventarios", "Entradas, salidas y costos por SKU", "Sincroniza directamente con la Cuenta 1107 en A")

    # ========================== PÁGINA 2 ==========================
    pdf.add_page()
    pdf.add_section("3. Foco Especial: MODULO G - Estados Financieros Proforma y el AFN")
    pdf.add_paragraph(
        "El Modulo G es el instrumento de planeacion financiera estrategica. Responde la pregunta critica del Director Financiero (CFO): 'Si planeamos incrementar las ventas un X% el proximo ano, cuanto dinero adicional necesitaremos conseguir de bancos o socios para financiar el crecimiento sin caer en insolvencia?'"
    )

    pdf.add_box(
        "MECANICA DE CALCULO DEL ESTADO PROFORMA",
        [
            "1. Ventas Proyectadas = Ventas Base * (1 + g)",
            "2. Costo de Ventas Proyectado = Ventas Proyectadas * (Costo Base / Ventas Base)",
            "3. Gastos Operativos Proforma = Gastos Fijos + Gastos Variables Proyectados",
            "4. Utilidad Neta Proforma = (UAII Proforma - Gastos Financieros) * (1 - Tasa Fiscal)",
            "5. Utilidades Retenidas Incrementadas = Utilidad Neta Proforma - Dividendos Proyectados"
        ],
        0.97, 0.98, 0.99, 0.1, 0.6, 0.3
    )

    pdf.add_box(
        "FORMULA Y DECISION ESTRATEGICA DEL AFN (FONDOS EXTERNOS NECESARIOS)",
        [
            "AFN = Total Activos Proforma - (Total Pasivos Proforma + Total Patrimonio Proforma)",
            "--------------------------------------------------------------------------------",
            "* Si AFN > 0 (Faltante de Fondos): El crecimiento supera la generacion de utilidades internas.",
            "  Decision: Tramitar credito bancario LP o emision de acciones para no quebrar.",
            "* Si AFN < 0 (Superavit de Fondos): La empresa genera mas caja de la necesaria para crecer.",
            "  Decision: Amortizar deuda cara, invertir en titulos o repartir dividendos a los socios."
        ],
        0.99, 0.98, 0.95, 0.8, 0.4, 0.1
    )

    pdf.add_section("4. Foco Especial: MODULO I - Control y Valuacion de Inventarios (NIC 2)")
    pdf.add_paragraph(
        "El Modulo I administra el activo realizable bajo la Norma Internacional de Contabilidad 2 (NIC 2). Valua por Costo Promedio Ponderado y se conecta directamente con el Balance General."
    )

    pdf.add_box(
        "CONEXION Y METRICAS CANONICAS DE INVENTARIOS",
        [
            "1. Conexion Directa: Valor Total = Suma(Stock Final_i * Costo Unitario_i) -> Cuenta 1107 en Modulo A",
            "2. Kardex Fisico: Stock Final = Stock Inicial + Entradas (Compras) - Salidas (Ventas)",
            "3. Rotacion Anual: Rotacion = Costo de Ventas (Modulo A) / Inventario Promedio (Modulo I)",
            "4. Dias de Inventario (DVI): Dias = 365 / Rotacion (Permanencia promedio en bodega)",
            "5. Alertas: Stock Final < Stock Minimo (Alerta Roja Reposicion) | > 2.5*Min (Sobreinventario)"
        ],
        0.96, 0.98, 0.96, 0.1, 0.5, 0.4
    )

    # ========================== PÁGINA 3 ==========================
    pdf.add_page()
    pdf.add_section("5. Guion Verbal Paso a Paso para la Exposicion ante el Profesor")
    
    pdf.add_box(
        "PASO 1: APERTURA Y ARQUITECTURA (30 SEGUNDOS)",
        [
            "'Profesor, nuestro sistema no es una planilla aislada; es un software web de Gestion Financiera",
            "estructurado en 9 modulos en cascada bajo normas NIC y NIIF. La ventaja principal es que no maneja",
            "celdas estaticas: cualquier cambio en el Balance detona un recalculacion reactiva en todos los modulos.'"
        ],
        0.98, 0.99, 1.0, 0.2, 0.4, 0.9
    )

    pdf.add_box(
        "PASO 2: EL NUCLEO CONTABLE (MODULO A) Y DIAGNOSTICO (B, C, D)",
        [
            "'En el Modulo A cargamos los Estados Financieros Comparativos y el sistema valida Activo = Pasivo +",
            "Patrimonio. De aqui alimentamos el Modulo B con 14 ratios y DuPont (Margen * Rotacion * Apalancamiento),",
            "y los Modulos C y D calculando el Punto de Equilibrio y la sensibilidad operativa con GAO, GAF y GAT.'"
        ],
        0.98, 0.99, 1.0, 0.2, 0.4, 0.9
    )

    pdf.add_box(
        "PASO 3: INVENTARIOS (MODULO I) Y PROFORMA (MODULOS E, F, G)",
        [
            "'El Modulo I gestiona las existencias fisicas bajo NIC 2 y sincroniza directamente con la cuenta 1107",
            "de Inventarios del Balance. Finalmente, los Modulos E, F y G cierran el ciclo: el Modulo E audita la caja",
            "real por NIC 7, el Modulo F proyecta el Presupuesto y el Modulo G calcula el AFN para saber si el",
            "crecimiento comercial requiere deuda bancaria o se autofinancia.'"
        ],
        0.98, 0.99, 1.0, 0.2, 0.4, 0.9
    )

    pdf.add_section("6. Respuestas a Preguntas Trampa del Profesor")
    pdf.add_table_row("Pregunta del Profesor", "Respuesta Tecnica Inmediata", "Fundamento Contable", is_header=True)
    pdf.add_table_row("Por que Utilidad != Efectivo?", "La utilidad es devengada y la caja es percibida", "Modulo E concilia partidas virtuales NIC 7")
    pdf.add_table_row("Que significa AFN negativo?", "Superavit de fondos internos de la empresa", "No requiere banco; amortiza pasivos o dividendos")
    pdf.add_table_row("Por que medir dias inventario?", "Evita capital ocioso en bodega y sobrecosto", "Ciclo de conversion de efectivo optimizado")
    pdf.add_table_row("Si cambio un saldo en Balance?", "Todo el arbol reactivo recalcula en tiempo real", "Arquitectura reactiva en memoria (React Context)")

    pdf.save()

if __name__ == "__main__":
    build_guide()
