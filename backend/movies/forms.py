from django import forms
from .models import Review

class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ['rating', 'text', 'status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Injection des attributs pour styliser le formulaire
        self.fields['text'].widget.attrs.update({
            'class': 'form-control bg-dark text-white border-dark', 
            'rows': 4, 
            'placeholder': 'Partagez votre avis détaillé sur ce film...'
        })
        self.fields['status'].widget.attrs.update({
            'class': 'form-select bg-dark text-white border-dark'
        })
        self.fields['rating'].widget = forms.HiddenInput(attrs={'id': 'id_rating'})
