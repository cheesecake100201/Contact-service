const express = require('express');
const bodyParser = require('body-parser');
const { sequelize, Contact } = require('./models');
const { Op } = require('sequelize');

const app = express();
app.use(bodyParser.json());

app.post('/identify', async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Either email or phoneNumber must be provided' });
  }

  try {
    const contacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { email },
          { phoneNumber },
        ],
      },
    });

    let primaryContact = null;
    let secondaryContacts = [];
    let primaryContacts = [];
    let emails = new Set();
    let phoneNumbers = new Set();

    contacts.forEach(contact => {
      if (contact.linkPrecedence === 'primary') {
        primaryContacts.push(contact);
        emails.add(contact.email);
        phoneNumbers.add(contact.phoneNumber);
      } else {
        secondaryContacts.push(contact);
        emails.add(contact.email);
        phoneNumbers.add(contact.phoneNumber);
      }
    });

    if (primaryContacts.length > 1) {
      primaryContacts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      primaryContact = primaryContacts[0];

      for (let i = 1; i < primaryContacts.length; i++) {
        await Contact.update(
          {
            linkedId: primaryContact.id,
            linkPrecedence: 'secondary',
          },
          {
            where: { id: primaryContacts[i].id },
          }
        );
        secondaryContacts.push(primaryContacts[i]);
      }
    } else if (primaryContacts.length === 1) {
      primaryContact = primaryContacts[0];
    }

    if (!primaryContact) {
      primaryContact = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      });
      if (email) emails.add(email);
      if (phoneNumber) phoneNumbers.add(phoneNumber);
    } else {
      if ((email && !emails.has(email)) || (phoneNumber && !phoneNumbers.has(phoneNumber))) {
        const newContact = await Contact.create({
          email,
          phoneNumber,
          linkedId: primaryContact.id,
          linkPrecedence: 'secondary',
        });
        secondaryContacts.push(newContact);
        if (email) emails.add(email);
        if (phoneNumber) phoneNumbers.add(phoneNumber);
      }
    }

    // Convert sets to arrays
    let emailsArray = Array.from(emails);
    let phoneNumbersArray = Array.from(phoneNumbers);

    // Ensure the primary email is always first
    if (primaryContact.email && emailsArray.includes(primaryContact.email)) {
      emailsArray = emailsArray.filter(e => e !== primaryContact.email);
      emailsArray.unshift(primaryContact.email);
    }

    const response = {
      contact: {
        primaryContatctId: primaryContact.id,
        emails: emailsArray,
        phoneNumbers: phoneNumbersArray,
        secondaryContactIds: secondaryContacts.map(contact => contact.id),
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
