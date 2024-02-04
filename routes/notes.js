const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Add this line
var fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes');

// ... rest of your code





router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id); // Ensure correct usage here
        const notes = await Notes.find({ user: userId }).populate('user');
        res.json(notes);
    } catch (err) {
        console.log(err);
        res.status(401).send("Server Error");
    }
});
router.post('/addnotes', fetchuser, [
    body("title", "Title is required").not().isEmpty(),
    body("description").isLength({ min: 5 }).withMessage("Description must be at least 5 chars long"),


], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                error: 'Validation failed',
                data: errors.array()
            });
        }
        const note = new Notes({
            title,
            description,
            tag,
            user: req.user.id
        })
        const savedNote = await note.save()

        res.json(savedNote)
    }
    catch (err) {
        console.log(err);
        res.status(409).send('Conflict')
    }

});

router.put('/updatenotes/:id', fetchuser, [
    body("title", "Title is required").not().isEmpty(),
    body("description").isLength({ min: 5 }).withMessage("Description must be at least 5 chars long"),


], async (req, res) => {
    const { title, description, tag } = req.body;
    const newNote = {};
    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (tag) { newNote.tag = tag };
    let note = await Notes.findById(req.params.id);
    if (!note) {
        return res.status(400).json({ error: "The note with the given ID  was not found." })
    }
    if (note.user.toString() !== req.user.id) {
        return res.status(401).json({ error: "You are not authorized to perform this action" })
    }
    note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
    res.json(note)
})

router.delete('/deletenotes/:id', fetchuser, async (req, res) => {
    const {title,description,tag}=req.body;
    let note = await Notes.findById(req.params.id);
    if (!note) {
        return res.status(400).json({ error: "The note with the given ID  was not found." })
    }
    if (note.user.toString() !== req.user.id) {
        return res.status(401).json({ error: "You are not authorized to perform this action" })
    }
    note= await Notes.findByIdAndDelete(req.params.id)
    res.json({"Success":"Note has been deleted",note:note});

    
})

module.exports = router