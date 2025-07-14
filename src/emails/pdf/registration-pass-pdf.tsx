
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#3F51B5',
    paddingBottom: 10,
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3F51B5',
  },
  fieldContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 120,
  },
  fieldValue: {
    fontSize: 12,
  },
  photoSection: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 20,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  photoContainer: {
    border: '1px solid #E0E0E0',
    padding: 5,
    borderRadius: 4,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center'
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  signatureContainer: {
    border: '1px solid #E0E0E0',
    padding: 5,
    borderRadius: 4,
    width: 240,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5'
  },
  signature: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  imageLabel: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
    color: '#666'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey',
  },
});

interface PdfProps {
    name: string;
    phone: string;
    category: string;
    photoUrl: string;
    signatureUrl: string;
}

const getFullUrl = (path: string) => {
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:9003${path}`;
  }
  // You might need to adjust this for your production environment
  return process.env.NEXT_PUBLIC_BASE_URL + path;
}


export const RegistrationPassPdf = ({ name, phone, category, photoUrl, signatureUrl }: PdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image style={styles.logo} src={getFullUrl('/logo.png')} />
        <Text style={styles.headerText}>Event Registration Pass</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.title}>Participant Information</Text>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Full Name:</Text>
          <Text style={styles.fieldValue}>{name}</Text>
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Contact Number:</Text>
          <Text style={styles.fieldValue}>{phone}</Text>
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Category:</Text>
          <Text style={styles.fieldValue}>{category}</Text>
        </View>
      </View>

      <View style={styles.photoSection}>
        <View>
            <View style={styles.photoContainer}>
                <Image style={styles.photo} src={photoUrl} />
            </View>
            <Text style={styles.imageLabel}>Participant Photo</Text>
        </View>
        <View>
            <View style={styles.signatureContainer}>
                <Image style={styles.signature} src={signatureUrl} />
            </View>
            <Text style={styles.imageLabel}>Signature</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        This is your official registration pass. Please present it upon entry.
      </Text>
    </Page>
  </Document>
);