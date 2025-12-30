import torch
import torch.nn as nn
import timm

# Initialize classifier
class StudyHabitClassifier(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        self.base_model = timm.create_model('resnet18', pretrained=True)
        self.features = nn.Sequential(*list(self.base_model.children())[:-1])
        resnet_out_size = 512

        for param in self.features.parameters():
            param.requires_grad = False

        self.classifier = nn.Linear(resnet_out_size, num_classes)
        self.dropout = nn.Dropout(p=0.5)

    def forward(self, x):
        x = self.features(x)
        x = torch.flatten(x, 1)
        x = self.dropout(x)

        output = self.classifier(x)

        return output