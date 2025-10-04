// components/pdf/ApplyPdfViewer.tsx
"use client";

import {
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ApplyPdfData } from "./ApplyPdfDoc"; // keep the type only

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, lineHeight: 1.4 },
  h1: { fontSize: 16, marginBottom: 12, fontWeight: 700 },
  section: { marginBottom: 10 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 140, fontWeight: 700 },
  val: { flexGrow: 1 },
  hr: { height: 1, backgroundColor: "#ddd", marginVertical: 10 },
  small: { fontSize: 9, color: "#555" },
});

export default function ApplyPdfViewer({ data }: { data: ApplyPdfData }) {
  const fullName = [data.firstName, data.middleName, data.lastName]
    .filter(Boolean)
    .join(" ");

  const lineage = [
    data.parentName &&
      `Parent: ${data.parentName} (${data.parentBirthdate || "—"})`,
    data.grandparentName &&
      `Grandparent: ${data.grandparentName} (${
        data.grandparentBirthdate || "—"
      })`,
    data.greatGrandparentName &&
      `Great-Grandparent: ${data.greatGrandparentName} (${
        data.greatGrandparentBirthdate || "—"
      })`,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="rounded-lg border bg-white" style={{ height: "70vh" }}>
      <PDFViewer style={{ width: "100%", height: "100%" }}>
        <Document>
          <Page size="LETTER" style={styles.page}>
            {/* Big, obvious sanity line */}
            <Text>PREVIEW OK</Text>

            <Text style={styles.h1}>
              Tarpum Bay Commonage Committee — Application
            </Text>

            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.val}>{fullName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.val}>{data.email || "—"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Date of Birth</Text>
                <Text style={styles.val}>{data.dob || "—"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.val}>{data.address || "—"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.val}>
                  {data.phone
                    ? `${data.phone}${
                        data.phoneType ? ` (${data.phoneType})` : ""
                      }`
                    : "—"}
                </Text>
              </View>
            </View>

            <View style={styles.hr} />

            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={styles.label}>Lineage</Text>
                <Text style={styles.val}>{lineage || "—"}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={styles.label}>Purpose for Land</Text>
                <Text style={styles.val}>{data.purpose || "—"}</Text>
              </View>
            </View>

            <View style={styles.hr} />

            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={styles.label}>Signature</Text>
                <Text style={styles.val}>{data.signature || "—"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.val}>{data.signDate || "—"}</Text>
              </View>
            </View>

            <Text style={styles.small}>
              By signing, the applicant affirms they have read and agree to the
              rules governing management and use of commonage land, and to
              commence work within 18 months.
            </Text>
          </Page>
        </Document>
      </PDFViewer>
    </div>
  );
}
